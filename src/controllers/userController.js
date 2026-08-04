import userService from '../services/userService.js';
import { ErrorResponse } from '../utils/helper.js';


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
}