import productService from '../services/productService.js';
import { buildRatingStats } from '../utils/ratingStats.js';

const formatProduct = (item) => {
  const product = item.toJSON();
  const reviews = product.reviews || [];
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    stock: product.stock,
    stock_status: Number(product.stock) > 0 ? 'in_stock' : 'out_of_stock',
    product_type: product.product_type,
    is_best_seller: product.is_best_seller,
    is_seasonal: product.is_seasonal,
    is_natural: product.is_natural,
    is_weekly_choice: product.is_weekly_choice,
    sales_count: product.sales_count,
    owner_id: product.owner_id,
    category: product.category ? product.category.name : null,
    region: product.region ? product.region.name : null,
    owner: product.owner,
    reviews,
    rating_stats: buildRatingStats(reviews),
    is_active: product.is_active,
    status: product.is_active ? 'active' : 'inactive',
    createdAt: product.createdAt,
  };
};

const formatProductListResponse = (result) => ({
  data: result.data.map(formatProduct),
  meta: {
    total: result.total,
    page: result.page,
    limit: result.limit,
    total_pages: result.total_pages,
  },
});

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

export const uploadProductImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'image faylı mütləqdir' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
  return res.status(201).json({ url: imageUrl });
};

export const getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.json(formatProductListResponse(result));
  } catch (error) {
    res.status(500).json({ error: 'Məhsulları gətirərkən xəta baş verdi', details: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.q || req.query.search;
    if (!searchTerm) {
      return res.status(400).json({ error: 'Axtarış üçün q və ya search parametri tələb olunur' });
    }
    const result = await productService.searchProducts(searchTerm, req.query);
    res.json(formatProductListResponse(result));
  } catch (error) {
    res.status(500).json({ error: 'Məhsul axtarışında xəta baş verdi', details: error.message });
  }
};

export const getPopularProducts = async (req, res) => {
  try {
    const result = await productService.getPopularProducts(req.query);
    res.json(formatProductListResponse(result));
  } catch (error) {
    res.status(500).json({ error: 'Populyar məhsulları gətirərkən xəta baş verdi', details: error.message });
  }
};

export const getWeeklyPicks = async (req, res) => {
  try {
    const result = await productService.getWeeklyPicks(req.query);
    res.json(formatProductListResponse(result));
  } catch (error) {
    res.status(500).json({ error: 'Həftənin seçimlərini gətirərkən xəta baş verdi', details: error.message });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const result = await productService.getMyProducts(req.user.id, req.query);
    res.json(formatProductListResponse(result));
  } catch (error) {
    res.status(500).json({ error: 'Məhsullarınızı gətirərkən xəta baş verdi', details: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await productService.getProductById(id);
    const product = item.toJSON();

    const reviews = product.reviews || [];

    res.json({
      ...product,
      rating_stats: buildRatingStats(reviews),
    });
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
