const { Product, Category, User, Attribute, ProductAttribute, Favourite } = require('../models/models');
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
                include: [{ model: Category }, { model: User }],
                order: [
                    ['id', 'ASC']
                ]
            });
            return res.json(products);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const product = await Product.findOne({ where: { id }, include: [{ model: Category }, { model: User }] });
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
                const products = await Product.findAll({
                    where: { categoryTitle },
                    include: [{ model: Category }, { model: User }]
                });
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
                return res.json(products)
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
            const favorite = await Favourite.findOne({ where: { productId: id } })
            if (favorite) {
                await favorite.destroy();
            }
            const attribute = await ProductAttribute.findOne({ where: { productId: id } })
            if (attribute) {
                await attribute.destroy();
            }
            await product.destroy();
            return res.json({ message: 'Товар удален' });
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description, price, introtext, geo, categoryTitle } = req.body;
    
            // Найти продукт по id
            const product = await Product.findByPk(id);
            if (!product) {
                return next(ApiError.badRequest('Продукт не найден'))
            }
    
            // Обновить поля продукта
            product.title = title || product.title;
            product.description = description || product.description;
            product.price = price || product.price;
            product.introtext = introtext || product.introtext;
            product.geo = geo || product.geo;
            product.categoryTitle = categoryTitle || product.categoryTitle;
    
            // Сохранить изменения
            await product.save();
    
            return res.json(product);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }
    
}



module.exports = new ProductController();
