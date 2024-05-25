const express=require('express')
const router=express.Router()
const { isAuthenticated } = require('../middlewares/auth')
const { getAllProduct,exploreProductById } = require('../controllers/productController')

router.get('/getAllProduct',getAllProduct)

router.get('/explore/:id',exploreProductById)

module.exports=router