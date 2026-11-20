const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

function getTokensToTry(req) {
    const tokens = [];
    const authHeader = req.headers.authorization;
    if (authHeader) {
        if (authHeader.startsWith("Bearer ")) {
            tokens.push(authHeader.split(" ")[1]);
        } else {
            tokens.push(authHeader);
        }
    }
    if (req.cookies?.token && !tokens.includes(req.cookies.token)) {
        tokens.push(req.cookies.token);
    }
    return tokens;
}

async function authMiddleare(req, res, next) {
    const tokens = getTokensToTry(req);

    if (tokens.length === 0) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing",
            status: "failed"
        });
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({ token: tokens[0] });

    if(isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized access, token is blacklisted",
            status: "failed"
        });
    }

    for (const token of tokens) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({
                    message: "Unauthorized access, user not found",
                    status: "failed"
                });
            }
            req.user = user;
            return next();
        } catch (error) {
            // try next token if available
        }
    }

    return res.status(401).json({
        message: "Unauthorized access, token is invalid",
        status: "failed"
    });
}

async function authSystemUserMiddleware(req, res, next) {
    const tokens = getTokensToTry(req);

    if (tokens.length === 0) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing",
            status: "failed"
        });
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({ token: tokens[0] });

    if(isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized access, token is blacklisted",
            status: "failed"
        });
    }

    for (const token of tokens) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.userId).select("+systemUser");

            if (!user) {
                return res.status(401).json({
                    message: "Unauthorized access, user not found",
                    status: "failed"
                });
            }

            if (!user.systemUser) {
                return res.status(403).json({
                    message: "Forbidden access, user is not a system user",
                    status: "failed"
                });
            }

            req.user = user;
            return next();
        } catch (error) {
            // try next token if available
        }
    }

    return res.status(401).json({
        message: "Unauthorized access, token is invalid",
        status: "failed"
    });
}

module.exports = {
    authMiddleware: authMiddleare,
    authSystemUserMiddleware: authSystemUserMiddleware
};
