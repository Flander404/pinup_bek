const Router = require('express')
const productImageController = require('../controller/productImageController')
const router = new Router()

router.post('/', productImageController.create)
router.get('/productId/:id', productImageController.getAllImagesByProductId)
router.delete('/productId/:productId/images/:id', productImageController.deleteImageById)

module.exports = router