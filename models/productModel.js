const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    productImage: {
        type:Object,
        default:{
            fieldId:"",
            url:""
        }
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
