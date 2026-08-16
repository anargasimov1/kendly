import { FarmerProfile, User, Product, Category, Region } from '../models/index.js';

class FarmerController {
  
  // 1. İstifadəçi özünü fermer elan edir (Təsdiqə göndərir)
  async createProfile(req, res, next) {
    try {
      const { bio, farmName, farmAddress, farmPhone, experienceYears, idCardNumber, profile_image } = req.body;
      const userId = req.user.id;

      // Artıq varsa
      const existingProfile = await FarmerProfile.findOne({ where: { user_id: userId } });
      if (existingProfile) {
        return res.status(400).json({ message: 'Sizin artıq farmer profiliniz var' });
      }

      await FarmerProfile.create({ 
        user_id: userId, 
        bio,
        farmName,
        farmAddress,
        farmPhone,
        experienceYears,
        idCardNumber,
        profile_image
      });
      
      // User-in rolunu da avtomatik 'farmer' edə bilərik, amma admin təsdiqi sonrası etmək daha düzgündür
      res.status(201).json({ message: 'Profiliniz yaradıldı. Admin təsdiqi gözlənilir.' });
    } catch (error) {
      next(error);
    }
  }

  // 2. Təsdiqlənmiş fermerlərin siyahısı (Hamı görə bilər)
  async getVerifiedFarmers(req, res, next) {
    try {
      const farmers = await FarmerProfile.findAll({
        where: { verification_status: 'approved' },
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
      });
      res.status(200).json(farmers);
    } catch (error) {
      next(error);
    }
  }

  // 3. Fermerin daxili detalı və onlayn yazdığı yazılar (bio)
  async getFarmerDetails(req, res, next) {
    try {
      const { id } = req.params;
      const farmer = await FarmerProfile.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['name', 'email', 'status'] }]
      });

      if (!farmer) {
        return res.status(404).json({ message: 'Fermer tapılmadı' });
      }

      const productCount = await Product.count({ where: { owner_id: farmer.user_id } });
      const farmerPlain = farmer.get({ plain: true });

      res.status(200).json({
        ...farmerPlain,
        product_count: productCount
      });
    } catch (error) {
      next(error);
    }
  }

  // 4. Fermerin qoyduğu məhsullar
  async getFarmerProducts(req, res, next) {
    try {
      const { id } = req.params; 
      // id birbaşa farmerProfile-ın user_id-si və ya profil_id-si ola bilər. Burada user_id olaraq götürək.
      const farmer = await FarmerProfile.findByPk(id);
      
      if (!farmer) return res.status(404).json({ message: 'Fermer tapılmadı' });

      const products = await Product.findAll({
        where: { owner_id: farmer.user_id },
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name'] },
          { model: Region, as: 'region', attributes: ['id', 'name'] },
        ],
        order: [['created_at', 'DESC']],
      });
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  // 5. Profilin yenilənməsi
  async updateMyBio(req, res, next) {
    try {
      const { bio, farmName, farmAddress, farmPhone, experienceYears, idCardNumber, profile_image } = req.body;
      const userId = req.user.id;

      const farmer = await FarmerProfile.findOne({ where: { user_id: userId } });
      if (!farmer) return res.status(404).json({ message: 'Farmer profiliniz yoxdur' });

      if (bio !== undefined) farmer.bio = bio;
      if (farmName !== undefined) farmer.farmName = farmName;
      if (farmAddress !== undefined) farmer.farmAddress = farmAddress;
      if (farmPhone !== undefined) farmer.farmPhone = farmPhone;
      if (experienceYears !== undefined) farmer.experienceYears = experienceYears;
      if (idCardNumber !== undefined) farmer.idCardNumber = idCardNumber;
      if (profile_image !== undefined) farmer.profile_image = profile_image;
      
      farmer.updatedAt = new Date();
      await farmer.save();

      res.status(200).json({ message: 'Bio uğurla yeniləndi', farmer });
    } catch (error) {
      next(error);
    }
  }
}

export default new FarmerController();
