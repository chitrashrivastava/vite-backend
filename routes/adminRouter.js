const express=require('express')
const router=express.Router()
const {registerAdmin,signinAdmin,currentAdmin,signOutAdmin}=require('../controllers/adminController')
const { isAuthenticated } = require('../middlewares/auth')

router.post('/currentAdmin',isAuthenticated,currentAdmin)
router.post('/signup',registerAdmin)
router.post('/login',signinAdmin)
router.get('/logout',signOutAdmin)

module.exports=router