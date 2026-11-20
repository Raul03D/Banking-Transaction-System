const accountmodel = require("../models/account.model");
const accoutmodel = accountmodel;

async function createAccountController(req,res){
    const user = req.user;

    const account = await accoutmodel.create({
        user:user._id
    })

    res.status(201).json({
        message:"Account created successfully",
        account
    })

}

async function getUserAccountsController(req,res){
    const accounts = await accoutmodel.find({user:req.user._id});

    res.status(200).json({
        accounts
    })
}

async function getAccountBalanceController(req,res){
    const {accountId} = req.params;

    const account = await accountmodel.findOne({
        _id:accountId,
        user:req.user._id
    });

    if(!account){
        return res.status(404).json({
            message:"Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId:account._id,
        balance:balance
    })
}
    
    module.exports = {
        createAccountController,
        getUserAccountsController,
        getAccountBalanceController
    }
