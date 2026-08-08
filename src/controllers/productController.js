import productService from '../services/productService.js';

export const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Məhsul yaradılarkən xəta baş verdi', details: error.message });
  }
};

// Bütün məhsulları gətir (və filterlə, axtar, səhifələ)
export const getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);
    
    // Tələb olunan Response formasına salınması
    const formattedData = result.data.map(item => {
      const product = item.toJSON();
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        category: product.category ? product.category.name : null,
        region: product.region ? product.region.name : null,
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
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
};
