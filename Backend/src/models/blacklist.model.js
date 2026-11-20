const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required"],
        unique:true,
    },
    blacklistedAt:{
        type:Date,
        default:Date.now,
        immutable:true
    }
},{
    timestamps:true
})

blacklistSchema.index({blacklistedAt:1},{expireAfterSeconds:60*60*24*7});

const tokenBlacklistModel = mongoose.model("tokenBlacklist",blacklistSchema);
module.exports = tokenBlacklistModel;
