const User = require("../Model/UserModel");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async(req,res,next)=>{
    try {
        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Please Login First",
            })
        }

        const decoded = await jwt.verify(token,process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        
        next();
    }
    catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }

}

exports.AuthorizeRoles = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:`Role: ${req.user.role} is not allowed to access this resource`,
            })
        }
        next();
    }
}