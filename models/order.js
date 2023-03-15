const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    
    itemName:{
        type: String,
        required: [true, 'please enter order item'],
        trim: true,
        maxLength: [100, 'order item cannot exceed 100 characters'],
    },
    status: {
        type: String,
        default: "processing"
    },
    userId:{
        type: String,
        required: [true, 'Provide user ID!']
    }
})

module.exports = mongoose.model('order', orderSchema)