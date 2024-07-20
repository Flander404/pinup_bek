const { AttributeCategory, Attribute, ProductAttribute, Product, Category } = require("../models/models");
const ApiError = require('../error/ApiError')

class AttributeController {
    async createAttributeCategory(req, res, next) {
        try {
            const { name, type, categoryTitle } = req.body;
            if (!type || !categoryTitle) {
                return next(ApiError.badRequest('Тип и категория обязательны для создания категории атрибутов'));
            }
            const categories = await Category.findOne({where: { title: categoryTitle }});
            if (!categories) {
                return next(ApiError.badRequest('Категория не найдена'));
            }
            const attributeCategory = await AttributeCategory.create({
                name,
                type,
                categoryTitle
            })
            return res.json(attributeCategory);
        } catch (err) {
            next(ApiError.internal("Ошибка сервера: " + err.message));
        }
    }
    async getAllAttributeCategories(req, res, next) {
        try {
            const attributeCategories = await AttributeCategory.findAll({
                include: [{ model: Attribute }]
            });
            return res.json(attributeCategories);
        } catch (err) {
            next(ApiError.internal("Ошибка сервера: " + err.message));
        }
    }
    async getAllAttributeCategoriesByTitle(req, res, next) {
        try {
            const { categoryTitle } = req.params
            const attributeCategories = await AttributeCategory.findAll({
                where: {
                    categoryTitle
                },
                include: [{ model: Attribute }]
            });
            return res.json(attributeCategories);
        } catch (err) {
            next(ApiError.internal("Ошибка сервера: " + err.message));
        }
    }
    async createAttribute(req, res, next) {
        try {
            const { name, attributeCategoryId } = req.body;
            if (!name || !attributeCategoryId) {
                return next(ApiError.badRequest('Название и категория атрибута обязательны для создания'));
            }
            const attributeCategories = await AttributeCategory.findByPk(attributeCategoryId);
            if (!attributeCategories) {
                return next(ApiError.badRequest('Категория атрибута не найдена'));
            }
            const attribute = await Attribute.create({
                name,
                attributeCategoryId
            });
            return res.json(attribute);
        } catch (err) {
            next(ApiError.internal("Ошибка сервера: " + err.message));
        }
    }
    async getAllAttributes(req, res, next) {
        try {
            const attributes = await Attribute.findAll();
            return res.json(attributes);
        } catch (err) {
            next(ApiError.internal("Ошибка сервера: " + err.message));
        }
    }

    async createAttributeProduct(req, res, next) {
        try {
            const { productId, attributeId, value } = req.body
            if (!productId || !attributeId || !value) {
                return next(ApiError.badRequest('Товар, атрибут и значение обязательны для создания связи'))
            }
            const product = await Product.findByPk(productId)
            if (!product) {
                return next(ApiError.badRequest('Товар не найден'))
            }
            const attribute = await Attribute.findByPk(attributeId)
            if (!attribute) {
                return next(ApiError.badRequest('Атрибут не найден'))
            }
            const attributes = await ProductAttribute.create({
                productId,
                attributeId,
                value
            })
            return res.json(attributes);
        } catch (err) {
            return next(ApiError.internal(err.message))
        }
    }
    async getAllAttributeProducts(req, res, next) {
        try {
            const { productId } = req.params

            if (!productId) {
                return next(ApiError.badRequest('Товар обязателен для получения связанных атрибутов'))
            }

            const attributes = await ProductAttribute.findAll({ where: { productId }, include: [{ model: Attribute }] })

            return res.json(attributes);
        } catch (err) {
            return next(ApiError.internal(err.message))
        }
    }
}

module.exports = new AttributeController();