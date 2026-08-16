import dashboardService from '../services/dashboardService.js';

export const getDashboard = async (req, res, next) => {
  try {
    const months = req.query.months ?? 7;
    const data = await dashboardService.getDashboard(months);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

export const getDashboardRevenueChart = async (req, res, next) => {
  try {
    const months = req.query.months ?? 7;
    const revenue_chart = await dashboardService.getRevenueChart(months);
    res.json(revenue_chart);
  } catch (error) {
    next(error);
  }
};

export const getDashboardCategorySales = async (req, res, next) => {
  try {
    const category_sales = await dashboardService.getCategorySales();
    res.json(category_sales);
  } catch (error) {
    next(error);
  }
};

export const getDashboardTopFarmers = async (req, res, next) => {
  try {
    const limit = req.query.limit ?? 5;
    const top_farmers = await dashboardService.getTopFarmers(limit);
    res.json(top_farmers);
  } catch (error) {
    next(error);
  }
};

export const getDashboardRecentOrders = async (req, res, next) => {
  try {
    const limit = req.query.limit ?? 5;
    const recent_orders = await dashboardService.getRecentOrders(limit);
    res.json(recent_orders);
  } catch (error) {
    next(error);
  }
};
