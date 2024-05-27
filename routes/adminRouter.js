const express=require('express')
const router=express.Router()
const {registerAdmin,signinAdmin,currentAdmin,signOutAdmin,fetchAllProducts,adminSendMail,adminForgetLink, uploadProduct, updateProduct,fetchProductsStore, fetchProductStockByStore,deleteProducts, outOfStock}=require('../controllers/adminController')
const { isAuthenticated } = require('../middlewares/auth')
// const { updateProduct } = require('../controllers/productController')
// const { uploadProducts } = require('../controllers/productController')

router.post('/currentAdmin',isAuthenticated,currentAdmin)
router.post('/signup',registerAdmin)
router.post('/login',signinAdmin)
router.get('/logout',signOutAdmin)
router.post('/send-mail',adminSendMail)
router.post('/forget-link/:id',adminForgetLink)
router.post('/upload-products',isAuthenticated,uploadProduct)
router.get('/getallproduct', isAuthenticated, fetchAllProducts)
router.get('/fetchProductStore/:store', isAuthenticated, fetchProductStockByStore)
router.delete('/deleteProducts/:store/:storeId',isAuthenticated,deleteProducts)
router.put('/updateProduct/:id',isAuthenticated,updateProduct)
router.get('/fetchOutOfStock/:store',isAuthenticated,outOfStock)


module.exports=router