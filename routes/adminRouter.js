const express=require('express')
const router=express.Router()
const {registerAdmin,signinAdmin,currentAdmin,signOutAdmin,adminSendMail,adminForgetLink}=require('../controllers/adminController')
const { isAuthenticated } = require('../middlewares/auth')

router.post('/currentAdmin',isAuthenticated,currentAdmin)
router.post('/signup',registerAdmin)
router.post('/login',signinAdmin)
router.get('/logout',signOutAdmin)
router.post('/send-mail',adminSendMail)
router.post('/forget-link/:id',adminForgetLink)

module.exports=router