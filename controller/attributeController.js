const { AttributeCategory, Attribute, ProductAttribute, Product, Category, sequelize, User, Image, SubCategory } = require("../models/models");
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize');

class AttributeController {
    async createAttributeCategory(req, res, next) {
        try {
            const { name, type, categoryTitle } = req.body;
            if (!type || !categoryTitle) {
                return next(ApiError.badRequest/('Тип и категория обязательны для создания категории атрибутов'));
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
            const { name, attributeCategoryName, parentAttributeName } = req.body;
            if (!name || !attributeCategoryName) {
                return next(ApiError.badRequest('Название и категория атрибута обязательны для создания'));
            }

            // Поиск категории атрибутов по имени
            const attributeCategory = await AttributeCategory.findOne({ where: { name: attributeCategoryName } });
            if (!attributeCategory) {
                return next(ApiError.badRequest('Категория атрибута не найдена'));
            }

            // Поиск родительского атрибута, если он указан
            let parentAttribute = null;
            if (parentAttributeName) {
                parentAttribute = await SubCategory.findOne({ where: { name: parentAttributeName } });
                if (!parentAttribute) {
                    return next(ApiError.badRequest('Родительский атрибут не найден'));
                }
            }

            // Создание нового атрибута
            const attribute = await Attribute.create({
                name,
                attributeCategoryName: attributeCategory.name,
                parentAttributeName: parentAttribute ? parentAttribute.name : null
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
    async getSubAttributes(req, res, next) {
        try {
            const { parentAttributeName } = req.params;
            if (!parentAttributeName) {
                return next(ApiError.badRequest('Имя родительского атрибута обязательно'));
            }

            const subAttributes = await Attribute.findAll({
                where: {
                    parentAttributeName
                }
            });

            return res.json(subAttributes);
        } catch (err) {
            next(ApiError.internal("Ошибка сервера: " + err.message));
        }
    }
    async getAllProductByAttributeId(req, res, next) {
        try {
            const { id } = req.params;
            const { fromPrice, toPrice, categoryTitle } = req.query;
    
            if (!id) {
                return next(ApiError.badRequest('Атрибут обязателен для получения продуктов с этим атрибутом'));
            }
    
            const attributeIdArray = id.split(',').map(id => id.trim());
    
            let priceFilter = {};
            if (fromPrice) {
                priceFilter[Op.gte] = parseFloat(fromPrice);
            }
            if (toPrice) {
                priceFilter[Op.lte] = parseFloat(toPrice);
            }
    
            let categoryFilter = {};
            if (categoryTitle) {
                categoryFilter = { categoryTitle: categoryTitle };
            }
    
            const productAttributes = await ProductAttribute.findAll({
                where: {
                    attributeId: {
                        [Op.in]: attributeIdArray
                    }
                },
                include: [{
                    model: Product,
                    where: {
                        ...priceFilter ? { price: priceFilter } : {},
                        ...categoryFilter
                    },
                    include: [{ model: User }, {model: Image}]
                }]
            });
    
            console.log('productAttributes:', productAttributes); // Логируем полученные атрибуты
    
            if (productAttributes.length === 0) {
                console.log('No products found for the given attribute IDs.');
                return res.json([]);
            }
    
            const uniqueProductsMap = new Map();
            productAttributes.forEach(pa => {
                if (pa.product) {
                    uniqueProductsMap.set(pa.product.id, pa.product);
                }
            });
    
            const uniqueProducts = Array.from(uniqueProductsMap.values());
    
            console.log('uniqueProducts:', uniqueProducts); // Логируем уникальные продукты
    
            return res.json(uniqueProducts);
        } catch (err) {
            console.error('Error fetching products by attribute ID:', err); // Логируем ошибку
            return next(ApiError.internal(err.message));
        }
    }

    async deleteAttribute(req,res,next){
        try{
            const { name } = req.params
    
            if(!name){
                return next(ApiError.badRequest('Название атрибута обязательно для удаления'))
            }

            const attribute = await Attribute.findOne({ where: { name } })
            if (!attribute) {
                return next(ApiError.badRequest('Атрибут не найден'))
            }
            await attribute.destroy()
            return res.status(200).send({ message: 'Атрибут успешно удален' })
        }catch(err){
            return next(ApiError.internal(err.message));
        }
    }

    async createSubCategory(req, res, next){
        try {
            const { name, attributeCategoryName, parentAttributeName, type } = req.body
            const attributeCategory = await AttributeCategory.findOne({where: { name: attributeCategoryName}})
            if (!attributeCategory) {
                return next(ApiError.badRequest('Родительская категория не найдена'))
            }
            const category = await SubCategory.create({
                name,
                attributeCategoryName,
                parentAttributeName,
                type
            })
            return res.json(category);
        } catch (err) {
            
            return next(ApiError.internal(err.message));
        }
    }

    async getAllSubCategoriesByAttributeName(req, res, next) {
        try {
            const { parentAttributeName } = req.params
            if (!parentAttributeName) {
                return next(ApiError.badRequest('Имя родительского атрибута обязательно'))
            }
            const subcategories = await SubCategory.findAll({ where: { parentAttributeName } })
            return res.json(subcategories);
        }catch(err) {
            return next(ApiError.internal(err.message));
        }
    }
    async deleteSubCategory(req, res, next){
        try{
            const { id } = req.params
            if(!id){
                return next(ApiError.badRequest('Имя подкатегории обязательно для удаления'))
            }
            const subcategory = await SubCategory.findOne({ where: { id } })
            if (!subcategory) {
                return next(ApiError.badRequest('Подкатегория не найдена'))
            }
            await subcategory.destroy()
            return res.status(200).send({ message: 'Подкатегория успешно удалена' })
        }catch(err){
            return next(ApiError.internal(err.message));
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