const transctionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require("mongoose");




async function createTransaction(req,res){

    const {fromAccountId, toAccountId, amount,idempotencyKey} = req.body;

    if(!fromAccountId || !toAccountId || !amount || !idempotencyKey){
        return res.status(400).json({message: "Missing required fields"});
        
    }

    const fromUserAccount = await accountModel.findOne({_id:fromAccountId});
    const toUserAccount = await accountModel.findOne({_id:toAccountId});

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({message: "Account not found"});
    }

    const isTransactionAlreadyExists = await transctionModel.findOne({
        idempotencyKey:idempotencyKey
    });

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction already completed",
                transaction:isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(200).json({
                message: "Transaction failed previously, please try again",
            })
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(200).json({
                message: "Transaction is reversed, please try again later",
            })
        }
    }

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({message: "One or both accounts are not active"});
    }

    const balance = await fromUserAccount.getBalance();

    if(balance < amount){
        return res.status(400).json({
        message: `Insufficient balance. Current balance is ${balance}.Required balance is ${amount}`
    });

    }

    let transaction;
    try {
    // Create a new transaction with status PENDING
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = await transctionModel.create([{
        fromAccout:fromAccountId,
        toAccount:toAccountId,
        amount:amount,
        idempotencyKey:idempotencyKey,
        status:"PENDING"
    }],{session:session});

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromAccountId,
        amount:amount,
        transaction:transaction[0]._id,
        type:"DEBIT"
    }],{session:session});

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccountId,
        amount:amount,
        transaction:transaction[0]._id,
        type:"CREDIT"
    }],{session:session});

    transaction[0].status = "COMPLETED";
    await transaction[0].save({session:session});

    await session.commitTransaction();
    session.endSession();
    }catch (error) {
            return res.status(500).json({message: "Transaction failed is pending to some issue,please retry after sometime"});
    }

    // Send email notifications to both users
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccountId);
    await emailService.sendTransactionEmail(toUserAccount.user.email, toUserAccount.user.name, amount, fromAccountId);
    

    res.status(201).json({
        message:"Transaction completed successfully",
        transaction:transaction[0]
    })


}

async function createInitialFundsTransaction(req,res){
    const {toAccountId, amount,idempotencyKey} = req.body;

    if(!toAccountId || !amount || !idempotencyKey){
        return res.status(400).json({message: "Missing required fields"});
    }

    const toUserAccount = await accountModel.findOne({
_id:toAccountId,
    })

    if(!toUserAccount){
        return res.status(400).json({message: "Account not found"});
    }

    const fromUserAccount = await accountModel.findOne({
        user:req.user._id,
        
    })

    if(!fromUserAccount){
        return res.status(400).json({message: "System user account not found"});
    }

    const session = await mongoose.startSession();
    session.startTransaction();


    const transaction = await transctionModel.create([{
        fromAccout:fromUserAccount._id,
        toAccount:toAccountId,
        amount:amount,
        idempotencyKey:idempotencyKey,
        status:"PENDING"
    }],{session:session});

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        transaction:transaction[0]._id,
        type:"DEBIT"
    }],{session:session});

    await (()=> {
        return new Promise((resolve)=> setTimeout(resolve, 100*1000));
    }) ()
    

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccountId,
        amount:amount,
        transaction:transaction[0]._id,
        type:"CREDIT"
    }],{session:session});

    transaction[0].status = "COMPLETED";
    await transaction[0].save({session:session});



    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
        message:"Initial funds transaction completed successfully",
        transaction:transaction[0]
    })

}
module.exports = {
    createTransaction,
    createInitialFundsTransaction
}