const Router = require('express')
const router = new Router()
const FavouriteController = require('../controller/favouriteController.js')

router.post('/', FavouriteController.create)
router.get('/user/:userId', FavouriteController.getAllByUserId)

module.exports = router;