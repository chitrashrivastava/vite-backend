const express = require('express')
const {  registerUser, signInUser,currentUser,signOutUser ,userSendmail,userResetPassword } = require('../controllers/indexController')
const { isAuthenticated } = require('../middlewares/auth')
const router = express.Router()

router.post('/signup', registerUser)

router.post('/login', signInUser)

router.post('/currentUser',isAuthenticated,currentUser)

router.get('/logout',signOutUser)
router.post('/send-mail',userSendmail)
router.post('/forget-link/:id',userResetPassword)

module.exports = router


