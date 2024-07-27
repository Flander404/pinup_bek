const Router = require('express')
const attributeController = require('../controller/attributeController')
const router = new Router()

router.post('/category', attributeController.createAttributeCategory)
router.get('/category', attributeController.getAllAttributeCategories)
router.get('/category/:categoryTitle', attributeController.getAllAttributeCategoriesByTitle)
router.delete('/category/:id', attributeController.deleteAttributeCategory)

router.post('/', attributeController.createAttribute)
router.get('/', attributeController.getAllAttributes)

router.post('/product', attributeController.createAttributeProduct)
router.get('/product/:productId', attributeController.getAllAttributeProducts)
router.delete('/product/:productId/', attributeController.deleteAttributeProduct)

module.exports = router;