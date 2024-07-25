const uuid = require('uuid');
const path = require('path');
const { Category, Favourite, Product } = require('../models/models');
const ApiError = require('../error/ApiError');

class CategoryController {
    async create(req, res, next) {
        try {
            const { title } = req.body;
            const { img } = req.files;
            let fileName = uuid.v4() + '.jpg';
            img.mv(path.resolve(__dirname, "..", "static", fileName));
            const category = await Category.create({
                title,
                img: fileName
            });
            return res.json(category);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async getAll(req, res, next) {
        try {
            const categories = await Category.findAll({
                order: [
                    ['id', 'ASC']
                ]
            });
            return res.json(categories);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const category = await Category.findOne({ where: { id } });
            if (!category) {
                return next(ApiError.badRequest('Категория не найдена'));
            }
            return res.json(category);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
                return next(ApiError.badRequest('Категория не найдена'));
            }
            const products = await Product.findAll({ where: { categoryTitle: title } })
            console.log(products);
            await category.destroy;
            return res.json({ message: 'Категория удалена' });
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }
}

module.exports = new CategoryController();
