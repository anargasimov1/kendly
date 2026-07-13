import { User, AuditLog, ContactMessage, ContentPage, FarmerProfile, Category, Region } from '../models/index.js';
import { sequelize } from '../config/db.js';

export const listUsers = async (req, res, next) => {
  try {
    const { role } = req.query; // Opsional rol filtri (məsələn: ?role=farmer)
    const where = role ? { role } : {};

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({ error: 'Status yalnız "active" və ya "suspended" ola bilər' });
    }

    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
        const err = new Error('İstifadəçi tapılmadı');
        err.statusCode = 404;
        throw err;
    }

    user.status = status;
    await user.save({ transaction: t });

    // Audit Log əlavə edirik
    await AuditLog.create({
      adminId: req.user.id,
      action: status === 'suspended' ? 'user.suspend' : 'user.activate',
      targetType: 'user',
      targetId: user.id.toString(),
      meta: { previousStatus: user.status, newStatus: status }
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'İstifadəçi statusu yeniləndi', user: { id: user.id, status: user.status } });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const listFarmerApplications = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const applications = await FarmerProfile.findAll({
      where: { verification_status: status },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

export const approveFarmer = async (req, res, next) => {
   const t = await sequelize.transaction();
   try {
     const { id } = req.params;
     const { status = 'approved' } = req.body;

     if (!['approved', 'rejected'].includes(status)) {
       return res.status(400).json({ error: 'Yanlış status' });
     }

     const profile = await FarmerProfile.findOne({ where: { user_id: id }, transaction: t });
     const user = await User.findByPk(id, { transaction: t });
     
     if (!user || !profile) {
        throw new Error('İstifadəçi və ya fermer profili tapılmadı');
     }

     profile.verification_status = status;
     await profile.save({ transaction: t });

     if (status === 'approved') {
       user.role = 'farmer';
       await user.save({ transaction: t });
     }

     await AuditLog.create({
      adminId: req.user.id,
      action: status === 'approved' ? 'farmer.approve' : 'farmer.reject',
      targetType: 'user',
      targetId: user.id.toString(),
      meta: { profileId: profile.id }
     }, { transaction: t });

     await t.commit();
     res.json({ message: status === 'approved' ? 'İstifadəçiyə fermer rolu verildi və profili təsdiqləndi' : 'Fermer müraciəti rədd edildi' });
   } catch(error) {
     await t.rollback();
     next(error);
   }
};

// --- YENİ İDARƏETMƏ (CONTACT, PAGES, CATEGORIES) ---

export const getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
    res.json(messages);
  } catch (error) { next(error); }
};

export const markMessageRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: "Mesaj tapılmadı" });
    msg.is_read = true;
    await msg.save();
    res.json({ message: "Mesaj oxunmuş hesab edildi" });
  } catch (error) { next(error); }
};

// Səhifələrin idarəsi (Create & Update)
export const createOrUpdatePage = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { slug, title, content } = req.body;
    let page = await ContentPage.findOne({ where: { slug }, transaction: t });
    let action = 'page.create';
    
    if (page) {
      action = 'page.update';
      page.title = title;
      page.content = content;
      page.updatedAt = new Date();
      await page.save({ transaction: t });
    } else {
      page = await ContentPage.create({ slug, title, content }, { transaction: t });
    }

    await AuditLog.create({
      adminId: req.user.id,
      action,
      targetType: 'page',
      targetId: page.id.toString(),
      meta: { slug }
    }, { transaction: t });

    await t.commit();
    res.json({ message: action === 'page.update' ? 'Səhifə yeniləndi' : 'Səhifə yaradıldı', page });
  } catch (error) { 
    await t.rollback();
    next(error); 
  }
};

// Category idarəsi
export const createCategory = async (req, res, next) => {
  try {
    const { name, parent_id } = req.body;
    const cat = await Category.create({ name, parent_id });
    
    await AuditLog.create({
      adminId: req.user.id,
      action: 'category.create',
      targetType: 'category',
      targetId: cat.id.toString(),
      meta: { name }
    });

    res.status(201).json(cat);
  } catch (error) { next(error); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, parent_id } = req.body;
    const cat = await Category.findByPk(id);
    if (!cat) return res.status(404).json({ message: 'Kateqoriya tapılmadı' });
    
    const prevName = cat.name;
    cat.name = name || cat.name;
    cat.parent_id = parent_id !== undefined ? parent_id : cat.parent_id;
    await cat.save();

    await AuditLog.create({
      adminId: req.user.id,
      action: 'category.update',
      targetType: 'category',
      targetId: cat.id.toString(),
      meta: { prevName, newName: cat.name }
    });

    res.json(cat);
  } catch (error) { next(error); }
};

// Region idarəsi
export const createRegion = async (req, res, next) => {
  try {
    const { name } = req.body;
    const reg = await Region.create({ name });
    
    await AuditLog.create({
      adminId: req.user.id,
      action: 'region.create',
      targetType: 'region',
      targetId: reg.id.toString(),
      meta: { name }
    });

    res.status(201).json(reg);
  } catch (error) { next(error); }
};

export const updateRegion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const reg = await Region.findByPk(id);
    if (!reg) return res.status(404).json({ message: 'Region tapılmadı' });
    
    const prevName = reg.name;
    reg.name = name || reg.name;
    await reg.save();

    await AuditLog.create({
      adminId: req.user.id,
      action: 'region.update',
      targetType: 'region',
      targetId: reg.id.toString(),
      meta: { prevName, newName: reg.name }
    });

    res.json(reg);
  } catch (error) { next(error); }
};

export const deleteRegion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reg = await Region.findByPk(id);
    if (!reg) return res.status(404).json({ message: 'Region tapılmadı' });
    
    const name = reg.name;
    await reg.destroy();

    await AuditLog.create({
      adminId: req.user.id,
      action: 'region.delete',
      targetType: 'region',
      targetId: id.toString(),
      meta: { name }
    });

    res.json({ message: 'Region silindi' });
  } catch (error) { next(error); }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cat = await Category.findByPk(id);
    if (!cat) return res.status(404).json({ message: 'Kateqoriya tapılmadı' });
    
    const name = cat.name;
    await cat.destroy();

    await AuditLog.create({
      adminId: req.user.id,
      action: 'category.delete',
      targetType: 'category',
      targetId: id.toString(),
      meta: { name }
    });

    res.json({ message: 'Kateqoriya silindi' });
  } catch (error) { next(error); }
};
