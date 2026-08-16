import userService from '../services/userService.js';
import { ErrorResponse } from '../utils/helper.js';
import { Follow, User } from '../models/index.js';
import bcrypt from 'bcrypt';
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const user = await userService.createUser(name, email, password, phone, address);
    res.status(201).json(user);
  } catch (error) {
    // Əgər eyni email ilə qeydiyyat cəhdi olunursa:
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: `Bu ${req.body.email} artıq qeydiyyatdan keçib`,
        details: error.errors[0].message
      });
    }
    res.status(500).json({ error: 'İstifadəçi yaradılarkən xəta baş verdi', details: error.message });
  }
};

export const findUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userService.getUserByIdWithOrders(id);
    if (user === null) {
      return res.status(404).send({
        status: 404,
        message: "istifadəçi tapılmadı"
      })
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'İstifadəçiləri gətirərkən xəta baş verdi', details: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user JWT token vasitəsilə gəlir
    const id = req.user.id;
    const user = await userService.getUserByIdWithOrders(id);
    if (user === null) {
      return res.status(404).send({
        status: 404,
        message: "İstifadəçi tapılmadı"
      })
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Məlumatları gətirərkən xəta baş verdi', details: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await userService.login(email, password);
    res.json({ token });

  } catch (error) {

    res
      .status(400)
      .send(new ErrorResponse(400, error.message))

  }
};

export const followUser = async (req, res) => {
  try {
    const follower_id = req.user.id; // cari login olan istifadəçi
    const following_id = req.params.id; // izlənmək istənən fermer/istifadəçi

    if (follower_id == following_id) {
      return res.status(400).json({ error: "Özünüzü izləyə bilməzsiniz" });
    }

    const targetUser = await User.findByPk(following_id);
    if (!targetUser) {
      return res.status(404).json({ error: "İstifadəçi tapılmadı" });
    }

    const existingFollow = await Follow.findOne({
      where: { follower_id, following_id }
    });

    if (existingFollow) {
      // Artıq izləyirsə unfollow et
      await existingFollow.destroy();
      return res.status(200).json({ message: "İzləmədən çıxarıldı" });
    } else {
      // İzləmirsə follow et
      await Follow.create({ follower_id, following_id });
      return res.status(201).json({ message: "İzlənildi" });
    }
  } catch (error) {
    res.status(500).json({ error: 'İzləmə əməliyyatında xəta baş verdi', details: error.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const id = req.user.id;
    const { name, phone, address, password } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    res.json({ message: 'Profil yeniləndi', user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
  } catch (error) {
    res.status(500).json({ error: 'Məlumatları yeniləyərkən xəta baş verdi', details: error.message });
  }
};