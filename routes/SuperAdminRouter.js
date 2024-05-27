const express=require('express')
const router=express.Router()
const {registerSuperAdmin} = require('../controllers/superAdminController')
router.post('/signup',registerSuperAdmin)

module.exports=router