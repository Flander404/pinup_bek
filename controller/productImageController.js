const path = require("path");
const { Image, Product } = require("../models/models");
const uuid = require('uuid');
const ApiError = require("../error/ApiError");
const fs = require('fs')

class ProductImageController {
    async create(req, res, next) {
        try {
            const { productId } = req.body;
            const { url } = req.files;
            if (!url) {
                return next(ApiError.badRequest('Изображение не загружено'));
            }
            let fileName = uuid.v4() + '.jpg';
            let idName = uuid.v4().replace(/-/g, '');
            url.mv(path.resolve(__dirname, "..", "static", fileName));

            const product = await Product.findByPk(productId);
            if (!product) {
                return next(ApiError.badRequest('Продукт не найден'));
            }

            const productImage = await Image.create({
                id: idName,
                productId,
                url: fileName
            });

            return res.json(productImage);
        } catch (err) {
            return next(ApiError.badRequest(err.message))
        }
    }

    async getAllImagesByProductId(req, res, next) {
        try {
            const { productId } = req.params; // id продукта

            const images = await Image.findAll({ where: { productId: productId } });

            if (images.length === 0) {
                return next(ApiError.badRequest('Изображения для этого продукта не найдены'));
            }

            return res.json(images);
        } catch (err) {
            return next(ApiError.badRequest(err.message));
        }
    }
    async getOneByUrlName(req, res, next) {
        try {
            const { url } = req.params
            const image = await Image.findOne({ where: { url: url } });
            if (!image) {
                return next(ApiError.badRequest('Изображение не найдено'))
            }
            return res.json(image)
        } catch (err) {
            return next(ApiError.internal(err.message))
        }
    }
    async deleteAllImagesByProductId(req, res, next) {
        try {
            const { productId } = req.params; // id продукта

            const images = await Image.findAll({ where: { productId: productId } });

            if (images.length === 0) {
                return next(ApiError.badRequest('Изображения для этого продукта не найдены'));
            }

            for (const image of images) {
                await image.destroy();
            }

            return res.status(200).json({ message: 'Изображение успешно удалено' });
        } catch (err) {
            return next(ApiError.badRequest(err.message));
        }
    }

    async deleteImageById(req, res, next) {
        try {
            const { productId, id } = req.params;
            const image = await Image.findOne({ where: { id: id, productId: productId } });

            if (!image) {
                return next(ApiError.badRequest('Изображение не найдено'));
            }

            const filePath = path.resolve(__dirname, "..", "static", image.url);

            // Удаление файла изображения
            fs.unlink(filePath, (err) => {
                if (err) {
                    return next(ApiError.internal('Ошибка при удалении файла', err));
                }
            });

            // Удаление записи из базы данных
            await image.destroy();

            return res.status(200).json({ message: 'Изображение успешно удалено' });
        } catch (err) {
            return next(ApiError.internal('Ошибка на сервере', err));
        }
    }

    async deleteImageByUrl(req, res, next) {
        try {
            const { url } = req.params
            const image = await Image.findOne({ where: { url: url } });
            if (!image) {
                return next(ApiError.badRequest('Изображение не найдено'))
            }
            image.destroy()
            return res.status(200).json({ message: 'Изображение успешно удалено' });
        } catch (err) {
            return next(ApiError.internal(err.message))
        }
    }
}

module.exports = new ProductImageController();