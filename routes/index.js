const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const categoryRouter = require('./categoryRouter')
const productRouter = require('./productRouter')
const productImageRouter = require('./productImageRouter')
const attributeRouter = require('./attributeRouter')

router.use('/user', userRouter)
router.use('/category', categoryRouter)
router.use('/product', productRouter)
router.use('/product-image', productImageRouter)
router.use('/attribute', attributeRouter)

module.exports = router