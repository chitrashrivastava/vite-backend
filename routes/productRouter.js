const express=require('express')
const router=express.Router()
const { isAuthenticated } = require('../middlewares/auth')
const { getAllProduct } = require('../controllers/productController')

router.get('/getAllProduct',getAllProduct)

module.exports=router