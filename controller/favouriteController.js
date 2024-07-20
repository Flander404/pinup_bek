const { Favourite, Product } = require('../models/models');
const ApiError = require('../error/ApiError');

class FavouriteController {
    async create(req, res, next) {
        try {
            const { userId, productId } = req.body
            if (!userId || !productId) {
                return next(ApiError.badRequest('Необходимы userId и productId для добавления в избранное'))
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
            const favourites = await Favourite.findAll({ where: { userId }, include: [{ model: Product }] })
            return res.json(favourites)
        } catch (err) {
            return next(ApiError.internal(err.message))
        }
    }
}

module.exports = new FavouriteController();