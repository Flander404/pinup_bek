
const { User } = require('../models/models')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const path = require('path')
const { where } = require('sequelize')
const ApiError = require('../error/ApiError')

const generateJwt = (id, name, img, status) => {
    return jwt.sign({ id: id, name: name, img: img, status }, process.env.SECRET_KEY, { expiresIn: '24h' })
}


class UserController {
    async registration(req, res, next) {
        try {
            const { id, name, status, img } = req.body;
            if (!id) {
                return next(ApiError.badRequest('Некоректный id пользователя'))
            }
            const candidate = await User.findOne({ where: { id } })
            if (candidate) {
                res.json({candidate})
            } else {
                const user = await User.create({ id, name, img, status })

                const token = generateJwt(user.id, user.name, user.img, status)

                res.json({ token })
            }
        } catch (err) {
            next(ApiError.badRequest(err.message))
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const users = await User.findAll()
            return res.json(users)
        } catch (err) {
            next(ApiError.internal(err.message))
        }
    }
    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User.findOne({ where: { id } })
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'))
            }
            return res.json(user)
        } catch (err) {
            next(ApiError.internal(err.message))
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { name, status, img } = req.body;
            const user = await User.findByPk(id);
    
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }
    
            user.name = name || user.name;
            user.status = status || user.status;
            user.img = img || user.img;
    
            await user.save();
    
            res.json(user);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    }
}

module.exports = new UserController();