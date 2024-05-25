const { catchAsyncErrors } = require('../middlewares/catchAsyncError')
const Admin=require('../models/adminModel')
const { sendToken } = require('../utils/sendToken');
const bcrypt = require('bcryptjs')
const ErrorHandler = require('../utils/errorHandler')
const imagekit=require('../utils/imagekit').initimagekit()
const Product=require('../models/productModel')
const { v4: uuidv4 } = require('uuid');
const {sendmail} =require('../utils/nodemailer')

// const User=require('../models/userModel');
// const Order = require('../models/orderModel');
const Store=require('../models/storeModel')
exports.registerAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        // console.log(req.body)
        // const authorizedSources = process.env.AUTHORIZED_EMAIL.split(',');
        const { email } = req.body;
        // if (!authorizedSources.includes(email)) {
        //     return res.status(403).json({ success: false, message: 'Unauthorized registration' });
        // }
        console.log(req.body)
        const { password } = req.body;
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
        }
        const newAdmin = new Admin({
            email,
            password,
        });

        await newAdmin.save();  
        sendToken(newAdmin, 201, res);
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


exports.uploadProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body);

        // Extracting necessary fields from the request body
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
            ...stores // Extract store data from req.body
        } = req.body;

        const imageFiles = req.files;
        if (!imageFiles || !imageFiles.image) {
            return res.status(400).json({ success: false, message: 'No image provided' });
        }

        const { data, name } = imageFiles.image;
        const uniqueFileName =` ${Date.now()}_${uuidv4()}_${name}`;
        const { fileId, url } = await imagekit.upload({
            file: data,
            fileName: uniqueFileName,
            folder: '/groceryproducts'
        });

        // Creating a new Product instance
        const product = new Product({
            productName,
            description,
            sellingPrice,
            purchasePrice,
            MRP,
            size,
            category,
            brand,
            gst,
            cgst,
            productCode,
            image: {
                url,
                fieldId: fileId
            }
        });

        await product.save();

        // Save store and stock data
        const processedStores = new Set(); // Set to store processed store names

        const storeEntries = Object.entries(stores);
        if (storeEntries.length > 0) {
            for (const [key, value] of storeEntries) {
                const match = key.match(/^stores\[(\d+)\]\[(store|stock)\]$/);
                if (match) {
                    const index = match[1];
                    const property = match[2];
                    const storeName = stores[`stores[${index}][store]`];
                    const stock = stores[`stores[${index}][stock]`];

                    // Check if the store already exists for the product and not processed yet
                    if (!processedStores.has(storeName)) {
                        const existingStore = await Store.findOne({ productId: product._id, storeName });
                        if (!existingStore) {
                            // Create Store instance for each unique store
                            const newStore = new Store({
                                productId: product._id,
                                storeName,
                                stock
                            });
                            await newStore.save();
                        }
                        processedStores.add(storeName); // Add the processed store name to the set
                    }
                }
            }
        }

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
});

exports.signinAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body)
        const { email, password } = req.body;

        // Find the admin by email
        const admin = await Admin.findOne({ email });

        // If admin not found, return 404
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }


        // Check if the password matches
        const isPasswordMatch =  bcrypt.compare(password, admin.password);

        // If password does not match, return 401
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If everything is correct, send token
        sendToken(admin, 200, res);
    } catch (error) {
        console.error('Error in loginAdmin controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

exports.currentAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("======", req.id)
        const admin = await Admin.findById(req.id).exec();
        console.log("=====:", admin)
        admin.isAuth = true
        if (!admin) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, admin });
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

exports.signOutAdmin= catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("token")
    res.json({ message: "Successfully Signout" })

})

exports.adminSendMail = catchAsyncErrors(async (req, res, next) => {
    const admin = await Admin.findOne({ email: req.body.email }).exec()
    if (!admin) {
        return next(
            new ErrorHandler("Admin Not Found with this email address", 404)
        )
    }
    const url1 = `${req.protocol}://${req.get("host")}/admin/forget-link/${admin._id}`
    const url = `http://localhost:5173/admin/forget-link/${admin._id}`
    sendmail(req, url1, res, url, next)
    res.json({ admin, url1 })
    admin.resetPassword = "1"
    await admin.save()
})

exports.adminForgetLink = catchAsyncErrors(async (req, res, next) => {
    console.log(req.body);
    const admin = await Admin.findById(req.params.id).exec();
    console.log(req.body.password);
    if (!admin) {
      return next(new ErrorHandler("Admin Not Found with this email address", 404));
    }
  
    if (admin.resetPassword === "1") {
      admin.resetPassword = "0";
      admin.password = req.body.password;
      await admin.save();
      res.status(200).json({ message: "Password Updated Successfully" });
    } else {
      return next(new ErrorHandler("Link Expired", 404));
    }
  });
  

  exports.fetchAllProducts = catchAsyncErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const searchQuery = req.query.q || '';
    const searchType = req.query.type || 'brand'; // Default search type is 'brand'

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        let searchConditions;

        // Define search conditions based on search type
        switch (searchType) {
            case 'brand':
                searchConditions = { brand: { $regex: new RegExp(searchQuery, 'i') } };
                break;
            case 'store':
                searchConditions = { store: { $regex: new RegExp(searchQuery, 'i') } };
                break;
            case 'productCode':
                searchConditions = { ProductCode: { $regex: new RegExp(searchQuery, 'i') } };
                break;
            default:
                searchConditions = { brand: { $regex: new RegExp(searchQuery, 'i') } }; // Default to brand search
                break;
        }

        const [Products] = await Promise.all([
            Product.find(searchConditions).skip(startIndex).limit(limit),
        ]);

        const allProducts = [...Products];

        const totalProducts = await Product.countDocuments(searchConditions);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({ success: true, data: allProducts, totalPages });
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


exports.fetchProductStockByStore = catchAsyncErrors(async (req, res, next) => {
    try {
        let storeName = req.params.store;
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const { search } = req.query;

        let productQuery = {};
        let storeQuery = {};

        // Make storeName case insensitive
        if (storeName) {
            storeName = new RegExp(storeName, 'i');
            storeQuery.storeName = storeName;
        }

        if (search) {
            productQuery = {
                $or: [
                    { productName: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                ]
            };
        }

        // Find store stocks matching the storeName
        const storeStocks = await Store.find(storeQuery);
        const productIds = storeStocks.map(data => data.productId);

        // Find products with the matching IDs and search query
        productQuery._id = { $in: productIds };

        const totalProducts = await Product.countDocuments(productQuery);
        const skip = (page - 1) * limit;
        const products = await Product.find(productQuery)  // Apply productQuery filter here
            .skip(skip)
            .limit(limit);
        console.log(products);

        const paginatedStoreStocks = await Store.find({
            ...storeQuery,
            productId: { $in: products.map(product => product._id) }
        }).populate('productId');
        console.log(paginatedStoreStocks);

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            count: products.length,
            products: paginatedStoreStocks
        });
    } catch (error) {
        next(error);
    }
});

exports.deleteProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        
        const storeId = req.params.storeId;
        let store = req.params.store;

        // Convert store name to case-insensitive regular expression
        store = new RegExp(store, 'i');

        // Find and delete the product from the specified store in the StoreStock schema
        const productInStock = await Store.findOneAndDelete({ _id:storeId, storeName: store });

        if (!productInStock) {
            return res.status(404).json({ success: false, message: 'Product not found in the specified store' });
        }

        // If the product has an image, delete it from ImageKit
        if (productInStock.productId.image && productInStock.productId.image.fieldId) {
            await imagekit.deleteFile(productInStock.productId.image.fieldId);
        }

        // Check if the product is associated with any other stores
        const otherStores = await Store.findOne({ productId });

        // If the product is not associated with any other stores, remove it from the Product schema
        if (!otherStores) {
            await Product.findByIdAndDelete(productId);
        }

        // Send success response
        res.status(200).json({ success: true, message: 'Product deleted successfully from the specified store' });
    } catch (error) {
        next(error);
    }
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body);
        const { id } = req.params;
        const updatedImageData = req.files ? req.files.image : null;
        const { stock, store, ...updatedProductData } = req.body;

        // Parse additionalStock from request body
        const additionalStock = [];
        for (const key in req.body) {
            if (key.startsWith('additionalStock[') && key.endsWith('][store]')) {
                const index = key.match(/additionalStock\[(\d+)\]\[store\]/)[1];
                additionalStock[index] = additionalStock[index] || {};
                additionalStock[index].store = req.body[key];
            }
            if (key.startsWith('additionalStock[') && key.endsWith('][stock]')) {
                const index = key.match(/additionalStock\[(\d+)\]\[stock\]/)[1];
                additionalStock[index] = additionalStock[index] || {};
                additionalStock[index].stock = req.body[key];
            }
        }

        // Find the product by ID
        const product = await Product.findById(id);

        // If product is not found, return an error
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Update product details
        Object.assign(product, updatedProductData);

        // If there's a new image, upload it
        if (updatedImageData) {
            const { data, name } = updatedImageData;
            const uniqueFileName = `${Date.now()}_${uuidv4()}_${name}`;
            const { fileId, url } = await imagekit.upload({
                file: data,
                fileName: uniqueFileName,
                folder: '/groceryproducts'
            });

            // Update the product image information
            product.image = { fileId, url };
        }

        // Save the updated product
        await product.save();

        // Process the main store stock update
        let mainStoreStock = await Store.findOne({ productId: id, storeName: store });

        if (!mainStoreStock) {
            // If store stock entry does not exist, create a new one
            mainStoreStock = new Store({
                productId: id,
                storeName: store,
                stock: stock
            });
        } else {
            // If store stock entry exists, update the stock
            mainStoreStock.stock = stock;
        }

        // Save the main store stock entry (whether new or updated)
        await mainStoreStock.save();

        // Process additional stock entries
        for (const additional of additionalStock) {
            if (additional && additional.store && additional.stock) {
                let storeStock = await Store.findOne({ productId: id, storeName: additional.store });

                if (!storeStock) {
                    // If store stock entry does not exist, create a new one
                    storeStock = new Store({
                        productId: id,
                        storeName: additional.store,
                        stock: additional.stock
                    });
                } else {
                    // If store stock entry exists, update the stock
                    storeStock.stock = additional.stock;
                }

                // Save each store stock entry (whether new or updated)
                await storeStock.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
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