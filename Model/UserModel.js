const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
        maxLength:[30,"Name cannot exceed 30 characters"],
        minLength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please Enter your Email"],
        unique:true,
        validate:[validator.isEmail, "Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"Please Enter your password"],
        select:false,
        minLength:[8,"Password should be greater than a character"],
    },
    role:{
        type:String,
        // default:"user",
        default:"admin",
    },
    avatar:{
        public_id:{
            type:String,
            // required:true,
        },
        url:{
            type:String,
            // required:true,
        }
    },
    

    resetPasswordToken:String,
    resetPasswordExpire:Date,
})

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})

userSchema.methods.generateToken = async function(){
        //hum yha bhi cookie expire hone wala function laga sakte hai
    return await jwt.sign({id:this._id},process.env.JWT_SECRET);
}

userSchema.methods.matchPassword = async function(password){
    console.log(password,this.password);
    return await bcrypt.compare(password,this.password);
}

// Generating password reset token
userSchema.methods.getPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15*60*1000;

    return resetToken;
}

module.exports = mongoose.model("User",userSchema);