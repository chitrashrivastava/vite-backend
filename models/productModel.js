const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        // required: [true, 'Product name is required']
    },
    description: {
        type: String,
    },
    sellingPrice: {
        type: Number,
        // required: [true, 'Product Selling price is required'],
        // min: [0, 'Selling Price cannot be negative']
    },
   
    category: {
        type: String,
        // required: [true, 'Product category is required']
    },
    brand: {
        type: String,
    },
    purchasePrice: {
        type: Number,
    },
    MRP: {
        type: Number,
        // required: [true, 'MRP is required'],
    },
    size: {
        type: String,
    },
    gst: {
        type: Number,
        // required: [true, 'GST percentage is required'],
        // min: [0, 'GST percentage cannot be negative'],
        // max: [100, 'GST percentage cannot exceed 100']
    },
    cgst: {
        type: Number,
        // required: [true, 'CGST percentage is required'],
        // min: [0, 'CGST percentage cannot be negative'],
        // max: [100, 'CGST percentage cannot exceed 100']
    },
    image: {
        type: Object,
        default: {
            fieldId: "",
            url: ""
        }
    },
    productCode: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

productSchema.index({ productName: 'text', description: 'text' });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;