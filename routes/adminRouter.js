const express=require('express')
const router=express.Router()
const {registerAdmin,signinAdmin,currentAdmin,signOutAdmin,adminSendMail,adminForgetLink}=require('../controllers/adminController')
const { isAuthenticated } = require('../middlewares/auth')
const { uploadProducts } = require('../controllers/productController')

router.post('/currentAdmin',isAuthenticated,currentAdmin)
router.post('/signup',registerAdmin)
router.post('/login',signinAdmin)
router.get('/logout',signOutAdmin)
router.post('/send-mail',adminSendMail)
router.post('/forget-link/:id',adminForgetLink)
router.post('/upload-products',isAuthenticated,uploadProducts)
module.exports=router