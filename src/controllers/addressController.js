import { Address } from '../models/index.js';

class AddressController {
  
  // Ünvan əlavə etmək
  async addAddress(req, res, next) {
    try {
      const user_id = req.user.id;
      const { title, contact_name, contact_phone, address_line, city, region, postal_code, is_default } = req.body;

      if (!address_line || !city || !contact_name || !contact_phone) {
        return res.status(400).json({ error: "contact_name, contact_phone, address_line və city mütləqdir" });
      }

      // Əgər bu default olacaqsa, əvvəlkilərin default-un silək
      if (is_default) {
        await Address.update({ is_default: false }, { where: { user_id } });
      }

      const newAddress = await Address.create({
        user_id, title, contact_name, contact_phone, address_line, city, region, postal_code, is_default: is_default || false
      });

      res.status(201).json(newAddress);
    } catch (error) {
      next(error);
    }
  }

  // Bütün ünvanları görmək
  async listAddresses(req, res, next) {
    try {
      const user_id = req.user.id;
      const addresses = await Address.findAll({ where: { user_id }, order: [['created_at', 'DESC']] });
      res.status(200).json(addresses);
    } catch (error) {
      next(error);
    }
  }

  // Ünvanı yeniləmək
  async updateAddress(req, res, next) {
    try {
      const user_id = req.user.id;
      const { id } = req.params;
      const { title, contact_name, contact_phone, address_line, city, region, postal_code, is_default } = req.body;

      const address = await Address.findOne({ where: { id, user_id } });
      if (!address) return res.status(404).json({ error: "Ünvan tapılmadı" });

      if (is_default && !address.is_default) {
        await Address.update({ is_default: false }, { where: { user_id } });
      }

      address.title = title !== undefined ? title : address.title;
      address.contact_name = contact_name || address.contact_name;
      address.contact_phone = contact_phone || address.contact_phone;
      address.address_line = address_line || address.address_line;
      address.city = city || address.city;
      address.region = region !== undefined ? region : address.region;
      address.postal_code = postal_code !== undefined ? postal_code : address.postal_code;
      if (is_default !== undefined) {
         address.is_default = is_default;
      }

      await address.save();
      res.status(200).json(address);
    } catch (error) {
      next(error);
    }
  }

  // Ünvanı silmək
  async deleteAddress(req, res, next) {
    try {
      const user_id = req.user.id;
      const { id } = req.params;

      const address = await Address.findOne({ where: { id, user_id } });
      if (!address) return res.status(404).json({ error: "Ünvan tapılmadı" });

      await address.destroy();
      res.status(200).json({ message: "Ünvan silindi" });
    } catch (error) {
      next(error);
    }
  }
}

export default new AddressController();
