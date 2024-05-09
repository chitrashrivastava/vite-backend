const express = require('express')
const {  registerUser, signInUser  } = require('../controllers/indexController')
const { isAuthenticated } = require('../middlewares/auth')
const router = express.Router()

router.post('/signup', registerUser)
router.post('/login', signInUser)


module.exports = router


