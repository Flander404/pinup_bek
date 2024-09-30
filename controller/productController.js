const { Product, Category, User, Attribute, ProductAttribute, Favourite, Image, sequelize } = require('../models/models');
const ApiError = require('../error/ApiError');
const { Op } = require('sequelize');

const uuid = require('uuid');

class ProductController {
    async create(req, res, next) {
        try {
            const { title, description, price, introtext, categoryTitle, userId, geo } = req.body;
            if (!title || !description || !price || !categoryTitle || !userId || !geo) {
                return next(ApiError.badRequest('Все поля обязательны для заполнения'));
            }

            const category = await Category.findOne({
                where: { title: categoryTitle },
            });
            if (!category) return next(ApiError.badRequest('Категория не найдена'));

            const user = await User.findByPk(userId);
            if (!user) return next(ApiError.badRequest('Пользователь не найден'));

            let idName = uuid.v4().replace(/-/g, '')

            const product = await Product.create({
                id: idName, title, description, price, introtext, categoryTitle: category.title, userId, geo
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
            const { fromPrice, toPrice, country, city } = req.query;

            let whereClause = {};

            if (fromPrice) {
                whereClause.price = { ...whereClause.price, [Op.gte]: parseFloat(fromPrice) };
            }

            if (toPrice) {
                whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(toPrice) };
            }

            // Извлекаем все продукты, соответствующие фильтру по цене
            const products = await Product.findAll({
                where: whereClause,
                include: [{ model: User }, { model: ProductAttribute }, { model: Image }],
                order: [['id', 'ASC']]
            });

            // Дополнительная фильтрация по стране и городу, если параметры переданы
            const filteredProducts = products.filter(product => {
                let geoCountry = product.geo.find(item => item.country)?.country;
                let geoCity = product.geo.find(item => item.city)?.city;

                let countryMatch = country ? geoCountry === country : true;
                let cityMatch = city ? geoCity === city : true;

                return countryMatch && cityMatch;
            });

            return res.json(filteredProducts);
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
            const { fromPrice, toPrice, country, city } = req.query;

            const category = await Category.findOne({ where: { title: categoryTitle } });
            if (!category) {
                return next(ApiError.badRequest('Категория не найдена'));
            }
            let whereClause = { categoryTitle: category.title };

            if (fromPrice) {
                whereClause.price = { ...whereClause.price, [Op.gte]: parseFloat(fromPrice) };
            }

            if (toPrice) {
                whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(toPrice) };
            }

            const products = await Product.findAll({
                where: whereClause,
                include: [{ model: Category }, { model: User }, { model: Image }]
            });

            const filteredProducts = products.filter(product => {
                let geoCountry = product.geo.find(item => item.country)?.country;
                let geoCity = product.geo.find(item => item.city)?.city;

                let countryMatch = country ? geoCountry === country : true;
                let cityMatch = city ? geoCity === city : true;

                return countryMatch && cityMatch;
            });

            return res.json(filteredProducts);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }
    async getByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            const products = await Product.findAll({ where: { userId }, include: [{ model: Category }, { model: Image }] })
            if (products.length <= 0) {
                return res.json(products)
            }
            return res.json(products);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async delete(req, res, next) {
        const transaction = await sequelize.transaction();

        try {
            const { id } = req.params;
            const product = await Product.findByPk(id, { transaction });

            if (!product) {
                return next(ApiError.badRequest('Товар не найден'));
            }

            // Удаление всех связанных данных
            const favorite = await Favourite.findOne({ where: { productId: id }, transaction });
            if (favorite) {
                await favorite.destroy({ transaction });
            }

            const attributes = await ProductAttribute.findAll({ where: { productId: id }, transaction });
            if (attributes.length) {
                await Promise.all(attributes.map(attr => attr.destroy({ transaction })));
            }

            const images = await Image.findAll({ where: { productId: id }, transaction });
            if (images.length) {
                await Promise.all(images.map(image => image.destroy({ transaction })));
            }

            // Удаление самого товара
            await product.destroy({ transaction });

            // Подтверждение транзакции
            await transaction.commit();

            return res.json({ message: 'Товар и все связанные данные успешно удалены' });
        } catch (err) {
            // Откат транзакции в случае ошибки
            await transaction.rollback();
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
            console.log(product, '!!!AAA');


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
