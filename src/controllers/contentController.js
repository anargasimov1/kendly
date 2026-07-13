import { ContentPage } from '../models/index.js';

class ContentController {
  // Parametrə görə (slug) səhifəni oxumaq (Məs: /api/pages/about-us)
  async getPage(req, res, next) {
    try {
      const { slug } = req.params;
      const page = await ContentPage.findOne({ where: { slug } });
      
      if (!page) {
        return res.status(404).json({ message: 'Səhifə tapılmadı' });
      }

      res.status(200).json(page);
    } catch (error) {
      next(error);
    }
  }
}

export default new ContentController();
