const express = require('express')
const {  registerUser, signInUser,currentUser,signOutUser  } = require('../controllers/indexController')
const { isAuthenticated } = require('../middlewares/auth')
const router = express.Router()

router.post('/signup', registerUser)

router.post('/login', signInUser)

router.post('/currentUser',isAuthenticated,currentUser)

router.get('/logout',signOutUser)
module.exports = router


