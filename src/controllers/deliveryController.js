import { DeliveryZone } from '../models/index.js';

class DeliveryController {
  
  // Zonalari listələmək
  async getZones(req, res, next) {
    try {
      const zones = await DeliveryZone.findAll();
      res.status(200).json(zones);
    } catch (error) {
      next(error);
    }
  }

  // Admin üçün zona əlavə etmək
  async createZone(req, res, next) {
    try {
      const { name, fee, min_order_amount } = req.body;
      const newZone = await DeliveryZone.create({ name, fee, min_order_amount });
      res.status(201).json(newZone);
    } catch (error) {
      next(error);
    }
  }

  // Zona yeniləmək
  async updateZone(req, res, next) {
    try {
      const { id } = req.params;
      const { name, fee, min_order_amount } = req.body;
      const zone = await DeliveryZone.findByPk(id);
      if (!zone) return res.status(404).json({ error: "Zona tapılmadı" });

      if (name) zone.name = name;
      if (fee !== undefined) zone.fee = fee;
      if (min_order_amount !== undefined) zone.min_order_amount = min_order_amount;

      await zone.save();
      res.status(200).json(zone);
    } catch (error) {
      next(error);
    }
  }

  // Zona silmək
  async deleteZone(req, res, next) {
    try {
      const { id } = req.params;
      const zone = await DeliveryZone.findByPk(id);
      if (!zone) return res.status(404).json({ error: "Zona tapılmadı" });

      await zone.destroy();
      res.status(200).json({ message: "Zona silindi" });
    } catch (error) {
      next(error);
    }
  }
}

export default new DeliveryController();
