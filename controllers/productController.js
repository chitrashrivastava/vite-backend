const Product=require('../models/productModel')
const  imagekit=require('../utils/imagekit').initimagekit()
const ErrorHandler=require('../utils/errorHandler')
const {catchAsyncErrors}=require('../middlewares/catchAsyncError')
const mongoose=require('mongoose')
const Store=require('../models/storeModel')

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



exports.exploreProductById = catchAsyncErrors(async (req, res) => {
    const { id } = req.params;
    console.log(req.params)

    try {
        // Find the product by ID
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const storeStocks = await Store.find({ productId: id });
console.log(storeStocks)
        // Extract store names and stock values
        const stores = storeStocks.map(({ storeName, stock }) => ({ storeName, stock }));

        // Return the product along with store names and stock
        console.log(product,stores)
        return res.status(200).json({ success: true, data: { product, stores } });
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


exports.uploadProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body);

        const {
            productName,
            purchasePrice,
            description,
            sellingPrice,
            category,
            brand,
            gst,
            cgst,
            productCode,
            MRP,
            size,
            ...stores
        } = req.body;

        const imageFiles = req.files;
        if (!imageFiles || !imageFiles.image) {
            return res.status(400).json({ success: false, message: 'No image provided' });
        }

        const { data, name } = imageFiles.image;
        const uniqueFileName = `${Date.now()}_${uuidv4()}_${name}`;
        const { fileId, url } = await imagekit.upload({
            file: data,
            fileName: uniqueFileName,
            folder: '/groceryproducts'
        });

        const product = new Product({
            productName,
            purchasePrice,
            description,
            sellingPrice,
            category,
            brand,
            gst,
            cgst,
            productCode,
            MRP,
            size,
            image: {
                fileId,
                url
            },
            stores
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product uploaded successfully',
            product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});