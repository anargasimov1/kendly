import { Cart, CartItem, Product, DeliveryZone, Settings } from '../models/index.js';

class CartController {
  
  // Aktiv (sifariş edilməmiş) səbəti tapan və ya yaradan daxili metod
  async getOrCreateCart(user_id) {
    let cart = await Cart.findOne({
      where: { user_id },
      order: [['created_at', 'DESC']]
    });
    
    if (!cart) {
      cart = await Cart.create({ user_id });
    }
    return cart;
  }

  // 1. Səbəti gətir
  async getCart(req, res, next) {
    try {
      const user_id = req.user.id;
      const cart = await Cart.findOne({
        where: { user_id },
        order: [['created_at', 'DESC']],
        include: [{ 
          model: CartItem, 
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'stock'] }]
        }]
      });

      if (!cart) {
        return res.status(200).json({ items: [], total: 0 });
      }

      // Ümumi məbləği hesablayaq
      let total = 0;
      cart.items.forEach(item => {
        total += item.quantity * Number(item.price);
      });

      res.status(200).json({ cart, total });
    } catch (error) {
      next(error);
    }
  }

  // 2. Səbətə məhsul əlavə et
  async addToCart(req, res, next) {
    try {
      const { product_id, quantity = 1 } = req.body;
      const user_id = req.user.id;

      if (!product_id) return res.status(400).json({ error: "product_id mütləqdir" });
      if (quantity < 1) return res.status(400).json({ error: "Miqdar 1-dən az ola bilməz" });

      const product = await Product.findByPk(product_id);
      if (!product) return res.status(404).json({ error: "Məhsul tapılmadı" });
      
      const cart = await this.getOrCreateCart(user_id);

      let cartItem = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });

      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        cartItem = await CartItem.create({ 
          cart_id: cart.id, 
          product_id, 
          quantity, 
          price: product.price 
        });
      }

      res.status(201).json({ message: 'Səbət yeniləndi', cartItem });
    } catch (error) {
      next(error);
    }
  }

  // 3. Məhsul sayını dəyişmək
  async updateItemQuantity(req, res, next) {
    try {
      const { id } = req.params; // CartItem ID
      const { quantity } = req.body;
      const user_id = req.user.id;

      if (quantity < 1) return res.status(400).json({ error: "Miqdar 1-dən az ola bilməz" });

      const cartItem = await CartItem.findByPk(id, {
        include: [{ model: Cart, as: 'cart', where: { user_id } }]
      });

      if (!cartItem) return res.status(404).json({ error: 'Məhsul səbətdə tapılmadı' });
      
      cartItem.quantity = quantity;
      await cartItem.save();

      res.status(200).json({ message: 'Səbətdəki miqdar yeniləndi', cartItem });
    } catch (error) {
      next(error);
    }
  }

  // 4. Səbətdən silmək
  async removeFromCart(req, res, next) {
    try {
      const { id } = req.params; // CartItem ID
      const user_id = req.user.id;

      const cartItem = await CartItem.findByPk(id, {
        include: [{ model: Cart, as: 'cart', where: { user_id } }]
      });

      if (!cartItem) return res.status(404).json({ error: 'Səbət məhsulu tapılmadı' });

      await cartItem.destroy();
      res.status(200).json({ message: 'Məhsul səbətdən silindi' });
    } catch (error) {
      next(error);
    }
  }

  // 5. Bütün səbəti təmizləmək
  async clearCart(req, res, next) {
    try {
      const user_id = req.user.id;
      const cart = await Cart.findOne({ where: { user_id }, order: [['created_at', 'DESC']] });
      
      if (cart) {
        await CartItem.destroy({ where: { cart_id: cart.id } });
      }
      res.status(200).json({ message: 'Səbət təmizləndi' });
    } catch (error) {
      next(error);
    }
  }

  // 6. Sifariş öncəsi baxış (Checkout Preview)
  async checkoutPreview(req, res, next) {
    try {
      const user_id = req.user.id;
      // İsteğe bağlı olaraq request-də delivery_zone_id də göndərilə bilər
      const { delivery_zone_id } = req.body; 

      const cart = await Cart.findOne({
        where: { user_id },
        order: [['created_at', 'DESC']],
        include: [{ model: CartItem, as: 'items' }]
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'Səbətiniz boşdur' });
      }

      let subtotal = 0;
      cart.items.forEach(item => {
        subtotal += item.quantity * Number(item.price);
      });

      const settings = await Settings.findByPk(1);
      let delivery_fee = settings ? Number(settings.delivery_fee) : 5.0;
      let free_delivery_min = settings ? Number(settings.free_delivery_min) : 30.0;

      if (delivery_zone_id) {
        const zone = await DeliveryZone.findByPk(delivery_zone_id);
        if (zone) {
          delivery_fee = Number(zone.fee);
          if (Number(zone.min_order_amount) > 0) {
             free_delivery_min = Number(zone.min_order_amount);
          }
        }
      }

      // Əgər subtotal free_delivery_min-dən çoxdursa çatdırılma pulsuzdur
      if (free_delivery_min > 0 && subtotal >= free_delivery_min) {
        delivery_fee = 0;
      }

      // Əvvəlki mock 15% endirim ləğv edildi, endirim sistemi (promo kod) olanda dəyişəcək
      const discount = 0;
      const final_total = Number((subtotal - discount + delivery_fee).toFixed(2));

      res.status(200).json({
        cart_id: cart.id,
        subtotal,
        discount,
        delivery_fee,
        final_total
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();
