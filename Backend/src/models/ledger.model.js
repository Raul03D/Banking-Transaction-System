const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"account is required"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"amount is required"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"transaction is required"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"type must be either CREDIT or DEBIT",
        },
        required:[true,"type is required"],
        immutable:true

    }
})

function preventLedgerFiction() {
    if (this && this.isNew) {
        return;
    }
    throw new Error("Ledger entries cannot be created or modified directly. Please use the transaction API to create ledger entries.");
}

ledgerSchema.pre('save', preventLedgerFiction);
ledgerSchema.pre('updateOne', preventLedgerFiction);
ledgerSchema.pre('deleteOne', preventLedgerFiction);
ledgerSchema.pre('findOneAndUpdate', preventLedgerFiction);
ledgerSchema.pre('findOneAndDelete', preventLedgerFiction);
ledgerSchema.pre('deleteMany', preventLedgerFiction);
ledgerSchema.pre('remove', preventLedgerFiction);
ledgerSchema.pre('updateMany', preventLedgerFiction);
ledgerSchema.pre('findOneAndReplace', preventLedgerFiction);


const ledgerModel = mongoose.model("ledger",ledgerSchema);

module.exports = ledgerModel;