import { Op } from 'sequelize';
import { Product, Category, Region, FarmerProfile, User, Review } from '../models/index.js';

class ProductService {
  async createProduct(productData) {
    const { name, price, category_id, region_id, owner_id, stock = 0, images = [] } = productData;

    if (!name?.trim() || price === undefined || category_id === undefined || region_id === undefined || owner_id === undefined) {
      const error = new Error('name, price, category_id, region_id və owner_id sahələri mütləqdir');
      error.statusCode = 400;
      throw error;
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      const error = new Error('price mənfi olmamalı, stock isə mənfi olmayan tam ədəd olmalıdır');
      error.statusCode = 400;
      throw error;
    }
    if (!Array.isArray(images) || images.some((image) => typeof image !== 'string')) {
      const error = new Error('images URL mətnlərindən ibarət massiv olmalıdır');
      error.statusCode = 400;
      throw error;
    }

    const [category, region, owner, farmerProfile] = await Promise.all([
      Category.findByPk(category_id),
      Region.findByPk(region_id),
      User.findByPk(owner_id),
      FarmerProfile.findOne({ where: { user_id: owner_id, verification_status: 'approved' } }),
    ]);
    if (!category || !region || !owner || owner.role !== 'farmer' || !farmerProfile) {
      const error = new Error('Seçilmiş kateqoriya, rayon və ya təsdiqli fermer tapılmadı');
      error.statusCode = 400;
      throw error;
    }

    return await Product.create(productData);
  }

  async getAllProducts(query = {}) {
    const {
      category,
      category_id,
      region,
      region_id,
      stock_status,
      min_price,
      max_price,
      is_active,
      product_type,
      is_best_seller,
      is_seasonal,
      is_natural,
      owner_id,
      is_weekly_choice,
      search,
      page = 1,
      limit = 10,
      sort_by = 'createdAt',
      sort_order = 'DESC'
    } = query;

    const where = {};

    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === true;
    }
    if (product_type) {
      where.product_type = product_type;
    }
    if (is_best_seller !== undefined) {
      where.is_best_seller = is_best_seller === 'true' || is_best_seller === true;
    }
    if (is_seasonal !== undefined) {
      where.is_seasonal = is_seasonal === 'true' || is_seasonal === true;
    }
    if (is_natural !== undefined) {
      where.is_natural = is_natural === 'true' || is_natural === true;
    }
    if (owner_id !== undefined) {
      where.owner_id = owner_id;
    }
    if (category_id !== undefined) {
      where.category_id = category_id;
    }
    if (region_id !== undefined) {
      where.region_id = region_id;
    }
    if (is_weekly_choice !== undefined) {
      where.is_weekly_choice = is_weekly_choice === 'true' || is_weekly_choice === true;
    }

    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = min_price;
      if (max_price) where.price[Op.lte] = max_price;
    }

    if (stock_status === 'in_stock') {
      where.stock = { [Op.gt]: 0 };
    } else if (stock_status === 'out_of_stock') {
      where.stock = { [Op.lte]: 0 };
    } else if (stock_status !== undefined) {
      const error = new Error('stock_status yalnız in_stock və ya out_of_stock ola bilər');
      error.statusCode = 400;
      throw error;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const include = [];

    const categoryInclude = {
      model: Category,
      as: 'category',
      attributes: ['id', 'name']
    };
    if (category) {
      categoryInclude.where = { name: category };
      categoryInclude.required = true;
    }
    include.push(categoryInclude);

    const regionInclude = {
      model: Region,
      as: 'region',
      attributes: ['id', 'name']
    };
    if (region) {
      regionInclude.where = { name: region };
      regionInclude.required = true;
    }
    include.push(regionInclude);
    
    include.push({
      model: User,
      as: 'owner',
      attributes: ['id', 'name'],
      include: [{ model: FarmerProfile, as: 'farmerProfile', attributes: ['bio', 'verification_status'] }]
    });

    include.push({
      model: Review,
      as: 'reviews',
      attributes: ['id', 'rating', 'comment', 'createdAt'],
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
    });

    // Default max limit to 50 as per requirement
    let parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) parsedLimit = 10;
    if (parsedLimit > 50) parsedLimit = 50;

    let parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage <= 0) parsedPage = 1;

    const offset = (parsedPage - 1) * parsedLimit;

    // Validate sort order
    const validSortOrders = ['ASC', 'DESC'];
    const orderDirection = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    // Verify sort_by column (allow only valid columns to avoid SQL injection)
    const validSortBy = ['price', 'name', 'createdAt', 'is_active', 'sales_count'];
    let sortColumn = validSortBy.includes(sort_by) ? sort_by : 'createdAt';
    if (sortColumn === 'sales_count') sortColumn = 'sales_count';
    if (sortColumn === 'createdAt') sortColumn = 'created_at';

    const { count, rows } = await Product.findAndCountAll({
      where,
      include,
      limit: parsedLimit,
      offset,
      order: [[sortColumn, orderDirection]],
      distinct: true // Important to get correct total count when using includes
    });

    return {
      data: rows,
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      total_pages: Math.ceil(count / parsedLimit)
    };
  }

  async getPopularProducts(query = {}) {
    return this.getAllProducts({
      ...query,
      sort_by: 'sales_count',
      sort_order: 'DESC',
      is_active: query.is_active ?? 'true',
    });
  }

  async getWeeklyPicks(query = {}) {
    return this.getAllProducts({
      ...query,
      is_weekly_choice: 'true',
      is_active: query.is_active ?? 'true',
      sort_by: 'createdAt',
      sort_order: 'DESC',
    });
  }

  async getMyProducts(ownerId, query = {}) {
    return this.getAllProducts({
      ...query,
      owner_id: ownerId,
    });
  }

  async searchProducts(searchTerm, query = {}) {
    return this.getAllProducts({
      ...query,
      search: searchTerm,
      is_active: query.is_active ?? 'true',
    });
  }

  async getProductById(id) {
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Region, as: 'region', attributes: ['id', 'name'] },
        { 
          model: User, 
          as: 'owner', 
          attributes: ['id', 'name'],
          include: [{ model: FarmerProfile, as: 'farmerProfile', attributes: ['bio', 'verification_status'] }]
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating', 'comment', 'createdAt'],
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
        }
      ]
    });
    if (!product) {
      const error = new Error('Məhsul tapılmadı');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async updateProduct(id, productData) {
    const product = await Product.findByPk(id);
    if (!product) {
      const error = new Error('Məhsul tapılmadı');
      error.statusCode = 404;
      throw error;
    }
    return await product.update(productData);
  }

  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      const error = new Error('Məhsul tapılmadı');
      error.statusCode = 404;
      throw error;
    }
    await product.destroy();
    return { message: 'Məhsul uğurla silindi' };
  }
}

export default new ProductService();
