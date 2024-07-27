const Router = require('express')
const router = new Router()
const FavouriteController = require('../controller/favouriteController.js')

router.post('/', FavouriteController.create)
router.get('/user/:userId', FavouriteController.getAllByUserId)
router.get('/user/:userId/product/:productId', FavouriteController.getOneByProductIdUserId)
router.delete('/user/:userId/product/:productId', FavouriteController.delete)

module.exports = router;