const { AttributeCategory, Attribute, ProductAttribute, Product, Category, sequelize } = require("../models/models");
const ApiError = require('../error/ApiError')

class AttributeController {
    async createAttributeCategory(req, res, next) {
        try {
            const { name, type, categoryTitle } = req.body;
            if (!type || !categoryTitle) {
                return next(ApiError.badRequest('Тип и категория обязательны для создания категории атрибутов'));
            }
            const categories = await Category.findOne({ where: { title: categoryTitle } });
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
    async deleteAttributeCategory(req, res, next) {
        const { id } = req.params;
        const transaction = await sequelize.transaction();

        try {
            const category = await AttributeCategory.findByPk(id, { transaction });
            if (!category) {
                return next(ApiError.badRequest('Категория атрибута не найдена'));
            }

            // Удаление категории и связанных с ней атрибутов и product-attributes
            await category.destroy({ transaction });

            // Подтверждение транзакции
            await transaction.commit();

            res.status(200).send({ message: 'Категория атрибута и связанные с ней атрибуты успешно удалены' });
        } catch (error) {
            // Откат транзакции в случае ошибки
            await transaction.rollback();
            next(error);
        }
    }
    async createAttribute(req, res, next) {
        try {
            const { name, attributeCategoryName } = req.body;
            if (!name || !attributeCategoryName) {
                return next(ApiError.badRequest('Название и категория атрибута обязательны для создания'));
            }

            // Поиск категории атрибутов по имени
            const attributeCategory = await AttributeCategory.findOne({ where: { name: attributeCategoryName } });
            if (!attributeCategory) {
                return next(ApiError.badRequest('Категория атрибута не найдена'));
            }

            // Создание нового атрибута
            const attribute = await Attribute.create({
                name,
                attributeCategoryName: attributeCategory.name
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
    async deleteAttributeProduct(req, res, next) {
        const { productId } = req.params;
        try {
            const result = await ProductAttribute.destroy({ where: { productId } });
            if (result === 0) {
                return next(ApiError.badRequest('Связь атрибута и товара не найдена'));
            }
            
            res.status(200).send({ message: 'Связь атрибута и товара успешно удалена' });
        } catch (err) {
            return next(ApiError.badRequest(err.message));
        }
    }
    
}

module.exports = new AttributeController();