const Product=require('../models/productModel')
const  imagekit=require('../utils/imagekit').initimagekit()
const ErrorHandler=require('../utils/errorHandler')
const {catchAsyncErrors}=require('../middlewares/catchAsyncError')
const mongoose=require('mongoose')

exports.uploadProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body);
        const { productName, productPrice, productDescription } = req.body;
        console.log(req.files);
        const imageFile = req.files.productImage;

        // Upload image to ImageKit
        const imageUploadResponse = await imagekit.upload({
            file: imageFile.data.toString('base64'), // Convert buffer to base64 string
            fileName: imageFile.name,
        });

        // Create product object
        const product = new Product({
            productName,
            productDescription,
            productPrice,
            productImage: {
                fieldId: imageUploadResponse.fileId,
                url: imageUploadResponse.url,
            },
        });

        // Save product to database
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product uploaded successfully',
            product,
        });
    } catch (error) {
        console.error('Error uploading product:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
})