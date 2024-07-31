const { Favourite, Product, User } = require('../models/models');
const ApiError = require('../error/ApiError');
const { model } = require('../db');

class FavouriteController {
    async create(req, res, next) {
        try {
            const { userId, productId } = req.body
            if (!userId || !productId) {
                return next(ApiError.badRequest('Необходимы userId и productId для добавления в избранное'))
            }

            const existingFavourite = await Favourite.findOne({ where: { userId, productId } });

            if (existingFavourite) {
                return next(ApiError.badRequest('Такой продукт уже добавлен в избранное'));
            }
            const favourite = await Favourite.create({
                userId,
                productId
            })
            return res.json(favourite)
        } catch (err) {
            return next(ApiError.internal(err.message))
        }
    }
    async getAllByUserId(req, res, next) {
        try {
            const { userId } = req.params
            const favourites = await Favourite.findAll({ where: { userId }, include: [{ model: Product, include: [{ model: User }] }] })
            return res.json(favourites)
        } catch (err) {
            return next(ApiError.internal(err.message))
        }
    }
    async getOneByProductIdUserId(req, res, next) {
        try {
            const { productId, userId } = req.params
            const favourite = await Favourite.findOne({ where: { productId, userId }, include: [{ model: Product }] });

            if (!favourite) {
                return res.json(false)
            }

            return res.json(true);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async delete(req, res, next) {
        try {
            const { userId, productId } = req.params;
            const favorite = await Favourite.findOne({ where: { productId: productId, userId: userId } });

            if (!favorite) {
                return next(ApiError.badRequest('Продукт не найден'));
            }

            await favorite.destroy();
            return res.json({ message: 'Продукт удален из избранных' });
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }
}

module.exports = new FavouriteController();