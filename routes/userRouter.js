const Router = require('express')
const userController = require('../controller/userController')
const router = new Router()

router.post('/reg', userController.registration)
router.get('/', userController.getAllUsers)
router.get('/:id', userController.getOne)

module.exports = router