const { Product, Category, User, Attribute, ProductAttribute } = require('../models/models');
const ApiError = require('../error/ApiError');

class ProductController {
    async create(req, res, next) {
        try {
            const { title, description, price, introtext, categoryTitle, userId, geo } = req.body;
            if (!title || !description || !price || !introtext || !categoryTitle || !userId || !geo) {
                return next(ApiError.badRequest('Все поля обязательны для заполнения'));
            }
            
            const category = await Category.findOne({
                where: { title: categoryTitle },
            });
            if (!category) return next(ApiError.badRequest('Категория не найдена'));
    
            const user = await User.findByPk(userId);
            if (!user) return next(ApiError.badRequest('Пользователь не найден'));
    
            const product = await Product.create({
                title, description, price, introtext, categoryTitle: category.title, userId, geo
            });
            await updateCategoryTotal(product); // Обновление счетчика категории
            
            const fullProduct = await Product.findOne({
                where: { id: product.id },
                include: [{ model: Category }]
            });
    
            res.json(fullProduct);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }
    


    async getAll(req, res, next) {
        try {
            const products = await Product.findAll({
                include: [{ model: Category }]
            });
            return res.json(products);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const product = await Product.findOne({ where: { id } });
            if (!product) {
                return next(ApiError.badRequest('Товар не найден'));
            }
            return res.json(product);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async getByCategory(req, res, next) {
        try {
            const { categoryTitle } = req.params;
            const category = await Category.findOne({ where: { title: categoryTitle } });
            if (!category) {
                return next(ApiError.badRequest('Категория не найдена'));
            } else {
                const products = await Product.findAll({ where: { categoryTitle } });
                return res.json(products);
            }
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }
    async getByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            const products = await Product.findAll({ where: { userId } })
            if (products.length <= 0) {
                return next(ApiError.badRequest('Нету товаров у этого пользователя'));
            }
            return res.json(products);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const product = await Product.findByPk(id);
            if (!product) {
                return next(ApiError.badRequest('Товар не найден'));
            }
            const category = await Category.findOne({ where: { title: product.categoryTitle } });
            await product.destroy();
            await updateCategoryTotal(category);
            return res.json({ message: 'Товар удален' });
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }
}

// Функция для обновления total в категории
async function updateCategoryTotal(category) {
    const totalProducts = await Product.count({
        where: { categoryTitle: category.title }
    });
    category.total = totalProducts;
    await category.save();
}

module.exports = new ProductController();
