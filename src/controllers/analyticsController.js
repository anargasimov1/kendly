import analyticsService from '../services/analyticsService.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const months = req.query.months ?? 7;
    const data = await analyticsService.getFullAnalytics(months);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsSalesTrend = async (req, res, next) => {
  try {
    const months = req.query.months ?? 7;
    const data = await analyticsService.getSalesTrend(months);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsRegionDistribution = async (req, res, next) => {
  try {
    const data = await analyticsService.getRegionDistribution();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsCategoryPerformance = async (req, res, next) => {
  try {
    const data = await analyticsService.getCategoryPerformance();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
