import productService from '../services/productService.js';

export const createProduct = async (req, res) => {
  try {
    const data = req.body;
    if (req.user.role === 'farmer') {
      data.owner_id = req.user.id;
    }
    const product = await productService.createProduct(data);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Məhsul yaradılarkən xəta baş verdi', details: error.message });
  }
};

// Bütün məhsulları gətir (və filterlə, axtar, səhifələ)
export const getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);
    
    const formattedData = result.data.map(item => {
      const product = item.toJSON();
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        stock: product.stock,
        product_type: product.product_type,
        is_best_seller: product.is_best_seller,
        is_seasonal: product.is_seasonal,
        is_natural: product.is_natural,
        category: product.category ? product.category.name : null,
        region: product.region ? product.region.name : null,
        owner: product.owner,
        reviews: product.reviews || [],
        is_active: product.is_active,
        createdAt: product.createdAt
      };
    });

    res.json({
      data: formattedData,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        total_pages: result.total_pages
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Məhsulları gətirərkən xəta baş verdi', details: error.message });
  }
};

// ID-yə görə tək məhsulu gətir
export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productService.getProductById(id);
    res.json(product);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const existingProduct = await productService.getProductById(req.params.id);
    if (req.user.role === 'farmer' && existingProduct.owner?.id !== req.user.id) {
        return res.status(403).json({ error: 'Siz yalnız öz məhsullarınızı yeniləyə bilərsiniz' });
    }
    
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const existingProduct = await productService.getProductById(req.params.id);
    if (req.user.role === 'farmer' && existingProduct.owner?.id !== req.user.id) {
        return res.status(403).json({ error: 'Siz yalnız öz məhsullarınızı silə bilərsiniz' });
    }

    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
};
