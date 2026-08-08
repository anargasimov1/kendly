import bcrypt from 'bcrypt';
import { Order, User, Address } from '../models/index.js';
import { sequelize } from '../config/db.js';
import { UserDto } from '../dto/userDto.js';
import jwt from 'jsonwebtoken';

class UserService {

    async getUserByEmail(email) {
        const user = await User.findOne({ where: { email } });
        return user;

    }


    async createUser(name, email, password, phone, address) {
        const transaction = await sequelize.transaction();

        try {
            const existingUser = await this.getUserByEmail(email);
            if (existingUser) {
                throw new Error("Bu email artıq mövcuddur");
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, password: hashPassword, phone, address }, { transaction });
            await transaction.commit();
            const dto = new UserDto(user);
            return dto;
        } catch (error) {
            console.error(error.message);
            await transaction.rollback()
            throw error;
        }
    }
    async getUserByIdWithOrders(id) {
        try {
            const user = await User.findByPk(id, {
                include: [
                    Order,
                    { model: Address, as: 'addresses' },
                    { model: User, as: 'Following', attributes: ['id', 'name', 'email', 'role'] }
                ]
            });
            if (user === null) {
                return null
            }
            const userWithOreder = new UserDto(user);
            return userWithOreder;
        } catch (error) {

            console.error(error.message);
            throw error;
        }
    }

    async login(email, password) {
        const username = await this.getUserByEmail(email);

        if (username) {
            const isMatch = await bcrypt.compare(password, username.password);

            if (!isMatch) {
                throw new Error("istifadəçi adı və ya parol yalnışdır");
            }

            const user = { id: username.id, name: username.name, role: username.role };

            const token = jwt.sign(user, process.env.JWT_SECRET || 'kendly_super_secret_key');

            return token;
        }
        else {
            throw new Error("istifadəçi adı və ya parol yalnışdır")
        }


    }
}

export default new UserService();