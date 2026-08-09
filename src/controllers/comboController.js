import { ComboMenu, ComboItem, Product } from '../models/index.js';

export const createCombo = async (req, res) => {
  try {
    const { name, description, price, image, stock, is_active, items } = req.body;
    
    // items -> [{product_id: 1, quantity: 2}, {product_id: 3, quantity: 1}]

    const combo = await ComboMenu.create({
      name,
      description,
      price,
      image,
      stock,
      is_active
    });
    
    if (items && items.length > 0) {
      const comboItems = items.map(item => ({
        combo_id: combo.id,
        product_id: item.product_id,
        quantity: item.quantity || 1
      }));
      await ComboItem.bulkCreate(comboItems);
    }
    
    const result = await ComboMenu.findByPk(combo.id, {
      include: [{
        model: ComboItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }]
      }]
    });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Kombo yaradılarkən xəta baş verdi', details: error.message });
  }
};

export const getAllCombos = async (req, res) => {
  try {
    const combos = await ComboMenu.findAll({
      include: [{
        model: ComboItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }]
      }]
    });
    
    res.json(combos);
  } catch (error) {
    res.status(500).json({ error: 'Komboları gətirərkən xəta baş verdi', details: error.message });
  }
};

export const getComboById = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await ComboMenu.findByPk(id, {
      include: [{
        model: ComboItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }]
      }]
    });
    
    if (!combo) {
      return res.status(404).json({ error: 'Kombo tapılmadı' });
    }
    
    res.json(combo);
  } catch (error) {
    res.status(500).json({ error: 'Kombo gətirərkən xəta baş verdi', details: error.message });
  }
};

export const updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, stock, is_active, items } = req.body;

    const combo = await ComboMenu.findByPk(id);
    if (!combo) {
      return res.status(404).json({ error: 'Kombo tapılmadı' });
    }
    
    await combo.update({ name, description, price, image, stock, is_active });

    if (items !== undefined) {
      // Köhnələri sil
      await ComboItem.destroy({ where: { combo_id: id } });
      // Yeniləri əlavə et
      if (items.length > 0) {
        const comboItems = items.map(item => ({
          combo_id: combo.id,
          product_id: item.product_id,
          quantity: item.quantity || 1
        }));
        await ComboItem.bulkCreate(comboItems);
      }
    }
    
    const result = await ComboMenu.findByPk(combo.id, {
      include: [{
        model: ComboItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }]
      }]
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Kombo yenilənərkən xəta baş verdi', details: error.message });
  }
};

export const deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await ComboMenu.findByPk(id);
    
    if (!combo) {
      return res.status(404).json({ error: 'Kombo tapılmadı' });
    }
    
    // ComboItem-ləri silməyə ehtiyac yoxdur, modeldə onDelete: CASCADE var (amma db səviyyəsində qurulmayıbsa deyə manual da silmək olar, Sequelize hasMany-də CASCADE edə bilər).
    await combo.destroy();
    res.json({ message: 'Kombo uğurla silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Kombo silinərkən xəta baş verdi', details: error.message });
  }
};
