const Router = require('express')
const attributeController = require('../controller/attributeController')
const router = new Router()

router.post('/category', attributeController.createAttributeCategory)
router.get('/category', attributeController.getAllAttributeCategories)
router.get('/category/:categoryTitle', attributeController.getAllAttributeCategoriesByTitle)

router.post('/', attributeController.createAttribute)
router.get('/', attributeController.getAllAttributes)

router.post('/product', attributeController.createAttributeProduct)
router.get('/product/:productId', attributeController.getAllAttributeProducts)

module.exports = router;