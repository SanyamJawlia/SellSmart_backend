const Order = require("../Model/OrderModel");
const Product = require("../Model/ProductModel");

exports.newOrder = async(req,res)=>{
    try {
        const {ShippingInfo,orderItems,paymentInfo,itemsPrice,ShippingPrice,TaxPrice,TotalPrice} = req.body;
        console.log("controller")
        console.log(req.body);
        const order = await Order.create({ShippingInfo,orderItems,paymentInfo,itemsPrice,ShippingPrice,TaxPrice,TotalPrice,paidAt:Date.now(),user:req.user._id});
        
        res.status(201).json({
            success:true,
            message:"New order is created",
            order,
        })
    }
    catch (err) {
        console.error(err);
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//get single order
exports.getSingleOrder = async(req,res)=>{
    try {
        const order = await Order.findById(req.params.id).populate("user","name email")
        
        if(!order){
            return res.status(404).json({
                success:true,
                message:"Order does not found",
            })
        }
        res.status(201).json({
            success:true,
            message:"Single order is found",
            order,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//get logged in user order
exports.myOrders = async(req,res)=>{
    try {
        const order = await Order.find({user:req.user._id}).populate("user","name email")
        
        res.status(201).json({
            success:true,
            message:"Order of single user is found",
            order,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//get all order (admin)
exports.getAllOrders = async(req,res)=>{
    try {
        const orders = await Order.find().populate("user");

        let totalAmount = 0;

        orders.forEach((order)=>{
            totalAmount += order.TotalPrice;
        })
        
        res.status(201).json({
            success:true,
            message:"All orders are found for admin",
            orders,
            totalAmount,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//update order status (admin)
exports.updateOrder = async(req,res)=>{
    try {
        const order = await Order.findById(req.params.id);
        if(!order){
            return res.status(404).json({
                success:true,
                message:"Order does not found",
            })
        }
        
        if(order.OrderStatus === "Delivered"){
            return res.status(400).json({
                success:false,
                message:"You have already delivered this product"
            })
        }

        order.orderItems.forEach(async(order)=>{
            await updateStock(order.id,order.quantity);
        })

        if(order.OrderStatus === "Processing"){
            order.deliveredAt = Date.now();
            order.OrderStatus = "Delivered";
        }
        await order.save();
        res.status(201).json({
            success:true,
            message:"Order status is updated",
            order,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

async function updateStock(id,quantity){
    const product = await Product.findById(id);

    product.Stock -= quantity;
    await product.save();
}

//delete order (admin)
exports.deleteOrder = async(req,res)=>{
    try {
        const order = await Order.findById(req.params.id);
        if(!order){
            return res.status(404).json({
                success:true,
                message:"Order does not found",
            })
        }
        await order.deleteOne();
        
        res.status(201).json({
            success:true,
            message:"Order is deleted Successfully",
            order,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}