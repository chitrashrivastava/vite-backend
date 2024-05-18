const Product=require('../models/productModel')
const  imagekit=require('../utils/imagekit').initimagekit()
const ErrorHandler=require('../utils/errorHandler')
const {catchAsyncErrors}=require('../middlewares/catchAsyncError')
const mongoose=require('mongoose')



exports.getAllProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        // Aggregate to fetch all products with associated stock and store name for all stores
        const productsWithStock = await Product.aggregate([
            {
                $lookup: {
                    from: 'storestocks', // Name of the StoreStock collection
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$productId', '$$productId'] }
                            }
                        },
                        {
                            $project: { storeName: 1, stock: 1, _id: 0 }
                        }
                    ],
                    as: 'stock'
                }
            }
        ]);
        console.log(productsWithStock)

        res.status(200).json({ success: true, data: productsWithStock });
    } catch (error) {
        next(error);
    }
});

