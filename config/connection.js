const crypto = require("crypto");
const {  foodStore } = require('../data/foodstore');
const { newOrder, getCurrentOrder, updateOrder, allOrders } = require('../controllers/orders');
const session = require("express-session");

exports.connectSocket = (socket) => {
    const session = socket.request.session
    let userId = session.userId

    if (!userId) {
        userId = crypto.randomBytes(20).toString('hex');
        session.userId = userId
        session.save((err) => {
            if (err) {
                console.error('User Id failed to save', err)
            } else {
                console.log('user Id successfully saved:', userId)
            }
            
        })

    }

    socket.on("send_message", async(data) => {
        console.log(data)

        if ( foodStore.find(el => el.name == data.message)){
            await newOrder({
                userId,
                itemName: data.message,

            })
            socket.emit("receive_message", {err:false, order:data.message, message: `You have placed order for ${data.message}, enter 99 to checkout`, time:data.time})
        }else{
            switch(data.message){
            
                case "1":
                    socket.emit('receive_message', { err:false, message: 'Please enter menu e.g,  Burger', metaData: foodStore, time:data.time})
                    break;

                case "99":
                    const currentOrder = await getCurrentOrder({userId})
                    if (currentOrder && currentOrder.itemName == data.currentOrder){
                        if(currentOrder.status == 'processing'){
                            const status = 'completed'
                            await updateOrder( currentOrder._id, { $set: { status } })
                            socket.emit('receive_message', { err:false, message: `order placed for ${data.currentOrder}`, time:data.time})
                        }else {
                            socket.emit('receive_message', { err:false, message: `This order is completed`, time:data.time})
                        }
                    }else{
                        socket.emit('receive_message', { err:false, message: `You have not placed any other, press 1 to place an order`, time:data.time})
                    }
                    break;

                case "97":
                    const currOrder = await getCurrentOrder({itemName:data.currentOrder})

                    if (currOrder){
                        socket.emit('receive_message', { err:false, message: `Your current order ${currOrder.itemName} is ${currOrder.status}`, time:data.time})
                    }else{
                        socket.emit('receive_message', { err:false, message: `You have not placed any other, press 1 to place an order`, time:data.time})
                    }
                    break;

                case "98":
                    const userOrders = await allOrders({userId})
                    if (userOrders.length){
                        metaData =[]
                        userOrders.map((userOrder, index) => {
                            metaData.push({id:userOrder._id.toString(), name:userOrder.itemName, status:userOrder.status})
                        })
                        
                        socket.emit('receive_message', { err:false, message: `Please find your orders below`, time:data.time, metaData})
                    }else{
                        socket.emit('receive_message', { err:false, message: `You have not placed any other, press 1 to place an order`, time:data.time})
                    }
                    break;

                case "0":
                    const order = await getCurrentOrder({userId: userId})
                    
                    if (order){
                        if(order.itemName == data.currentOrder && order.status == 'processing'){
                            console.log("we are here")
                            const status = 'cancelled'
                            await updateOrder( order._id, { $set: { status } })
                            socket.emit('receive_message', { err:false, message: `Your order for ${order.itemName} has been cancelled, press 1 to place another order`, time:data.time})
                        }else{
                            socket.emit('receive_message', { err:false, message: `This order has already been completed`, time:data.time})
                        }
                    }else{
                        socket.emit('receive_message', { err:false, message: `You have not placed any other, press 1 to place an order`, time:data.time})
                    }
                    break;
    
                default:
                    socket.emit("receive_message", {...data, err:true})
    
            }
    
        }


        
    })

}
