import { Category, Region } from '../models/index.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getRegions = async (req, res, next) => {
  try {
    const regions = await Region.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    res.json(regions);
  } catch (error) {
    next(error);
  }
};
