const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    ShippingInfo:{
        address:{
            type:String,
            required:[true,"Please Enter your address"],
        },
        city:{
            type:String,
            required:[true,"city daal do"],
        },
        state:{
            type:String,
            required:[true,"state daal do"],
        },
        country:{
            type:String,
            required:[true,"country daal do"],
            default:"India",
        },
        pincode:{
            type:Number,
            required:[true,"pincode daal do"],
        },
        phone:{
            type:Number,
            required:[true,"phoneNo daal do"],
        }
    },

    orderItems:[
        {
            name:{
                type:String,
                required:[true,"Please Enter your product name"],
            },
            price:{
                type:Number,
                required:[true,"price daal do"],
            },
            quantity:{
                type:Number,
                required:[true,"quantity daal do"],
            },
            image:{
                public_id:{
                    type:String,
                    required:true
                },
                url:{
                    type:String,
                    required:true
                }
            },
            //productId
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required:true,
            },
        }
    ],

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        // required:true,
    },

    paymentInfo:{
        id:{
            type:String,
            required:[true,"payment id daal do bhai"],
            default:"sampleId"

        },
        status:{
            type:String,
            required:[true,"payment status bhi daal do"],
            default:"Done"
        }
    },

    paidAt:{
        type:Date,
        required:[true,"paidAt bhi daal do"],
        default:Date.now(),
    },

    itemsPrice:{
        type:Number,
        default:0,
        required:[true,"itemsPrice bhi daal do"],
    },

    ShippingPrice:{
        type:Number,
        default:0,
        required:[true,"ShippingPrice bhi daal do"],
    },

    TaxPrice:{
        type:Number,
        default:0,
        required:[true,"ShippingPrice bhi daal do"],
    },

    TotalPrice:{
        type:Number,
        default:0,
        required:[true,"TotalPrice bhi daal do"],
    },

    OrderStatus:{
        type:String,
        required:true,
        default:"Processing",
    },

    deliveredAt: Date,

    createdAt:{
        type:Date,
        default: Date.now,
    },
})


module.exports = mongoose.model("Order",orderSchema);