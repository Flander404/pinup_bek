const Router = require('express')
const productImageController = require('../controller/productImageController')
const router = new Router()

router.post('/', productImageController.create)
router.get('/product/:productId', productImageController.getAllImagesByProductId)
router.get('/:url', productImageController.getOneByUrlName)
router.delete('/:url', productImageController.deleteImageByUrl)
router.delete('/product/:productId', productImageController.deleteAllImagesByProductId)
router.delete('/product/:productId/image/:id', productImageController.deleteImageById)

module.exports = router