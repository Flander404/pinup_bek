const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const categoryRouter = require('./categoryRouter')
const productRouter = require('./productRouter')
const productImageRouter = require('./productImageRouter')
const attributeRouter = require('./attributeRouter')
const favoriteRouter = require('./favoriteRouter')

router.use('/user', userRouter)
router.use('/category', categoryRouter)
router.use('/product', productRouter)
router.use('/product-image', productImageRouter)
router.use('/attribute', attributeRouter)
router.use('/favourite', favoriteRouter)

module.exports = router