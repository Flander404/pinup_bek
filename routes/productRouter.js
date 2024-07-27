const Router = require('express')
const productController = require('../controller/productController')
const router = new Router()

router.post('/', productController.create)
router.get('/', productController.getAll)
router.get('/:id', productController.getOne)
router.get('/category/:categoryTitle', productController.getByCategory)
router.get('/user/:userId', productController.getByUserId)
router.delete('/:id', productController.delete)
router.put('/:id', productController.update)

module.exports = router