const Order = require('../models/order');


const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Create a new order   =>  /api/v1/order/new
exports.newOrder = catchAsyncErrors(async ( params ) => {
    return Order.create( params )
})

//Get current order
exports.getCurrentOrder = async( params ) => {
    return Order.findOne( params )
}

//Update state of order
exports.updateOrder = async( id, payload) => {
    return Order.findByIdAndUpdate( id, payload, { new: true, runValidators: true })
}

//Get all orders
exports.allOrders = async( params ) => {
    return Order.find( params )
}