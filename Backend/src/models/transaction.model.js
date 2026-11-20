const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
     fromAccout:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"fromAccount is required"],
        index:true
     },
        toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"toAccount is required"],
        index:true
        },
        status:{
            type:String,
            enum:{
                values:["PENDING","COMPLETE","COMPLETED","FAILED","REVERSED"],
                message:"Status must be either PENDING, COMPLETE, COMPLETED, FAILED or REVERSED"
            },
            default:"PENDING"
        },
        amount:{
            type:Number,
            required:[true,"amount is required"],
            min:[0,"amount must be greater than or equal to 0"]
        },
        idempotencyKey:{
            type:String,
            required:[true,"idempotencyKey is required"],
            unique:true,
            index:true
        }
},{
    timestamps:true
})

const transactionModel = mongoose.model("transaction",transactionSchema);

module.exports = transactionModel;