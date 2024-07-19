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
            let fileName = uuid.v4() + '.jpg';
            url.mv(path.resolve(__dirname, "..", "static", fileName));

            const product = await Product.findByPk(productId)
            if (!product) {
                return next(ApiError.badRequest('Продукт не найден'));
            }
            const productImage = await Image.create({
                productId,
                url: fileName
            })

            return res.json(productImage);
        } catch (err) {
            console.log(err);
        }
    }

    async getAllImagesByProductId(req, res, next) {
        try {
            const { id } = req.params; // id продукта
            const { imageId } = req.query; // Получение query-параметра imageId
    
            if (imageId) {
                const image = await Image.findOne({ where: { id: imageId, productId: id } });
    
                if (!image) {
                    return next(ApiError.badRequest('Изображение не найдено'));
                }
    
                return res.json(image);
            }
    
            const images = await Image.findAll({ where: { productId: id } });
    
            if (images.length === 0) {
                return next(ApiError.badRequest('Изображения для этого продукта не найдены'));
            }
    
            return res.json(images);
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
}

module.exports = new ProductImageController();