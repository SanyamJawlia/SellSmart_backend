const User = require("../Model/UserModel");
const sendEmail = require("../Utils/SendEmail.js");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

exports.registerUser = async(req,res)=>{
    try {
        console.log("controller")
        console.log(req.body)
        console.log(req.body.name);
        console.log(req.body.avatar);
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder:"avatars"
        });
        console.log("below cloud")
          const { name, email, password } = req.body;
        
          const user = await User.create({
            name,
            email,
            password,
            avatar: {
              public_id: myCloud.public_id,
              url: myCloud.secure_url,
            },
          });
        const token = await user.generateToken();
        res.status(201).cookie("token",token,{
            expires:new Date(Date.now() + 60*24*60*60*1000),
            httpOnly:true,
        }).json({
            success:true,
            message:"User Registered && Login both Successfully",
            user,
            token,
        })
    }
    catch (err) {
        console.log("error")
        console.error("error uplading",err);
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

exports.loginUser = async(req,res)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Enter Email and password",
            })
        }
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User does not found",
            })
        }

        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:"Password does not matched",
            })
        }

        const token = await user.generateToken();
        res.status(200).cookie("token",token,{
            expires:new Date(Date.now() + 60*24*60*60*1000),
            httpOnly:true,
        }).json({
            success:true,
            message:"User Login Successfully",
            user,
            token,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}


exports.logout = async(req,res)=>{
    try {
        res.status(200).cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true,
        }).json({
            success:false,
            message:"User Logged Out Successfully",
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}


exports.forgotPassword = async(req,res)=>{
    try {
        // const {email} = req.body;
        const user = await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User does not found",
            })
        }

        //generation reset password token
        const resetToken = user.getPasswordResetToken();
        
        await user.save({validateBeforeSave:false});
        
        const resetPasswordUrl = `${req.protocol}://${req.get("host")}:4000/api/v1/password/reset/${resetToken}`
        const message = `Your password reset token is: \n\n ${resetPasswordUrl} \n\nIf you didn't request this token then please ignore this email.`;
        
        try {
            await sendEmail({
                email:user.email,
                subject:"SellSmart Password Recovery",
                message,
            })

            res.status(200).json({
                success:true,
                message:`Password reset email has send to ${user.email}`,
            })
        }
        catch (error) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined
            await user.save({validateBeforeSave:false});

            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }

        res.status(200).json({
            success:true,
            user
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//resetPassword
exports.resetPassword = async(req,res)=>{
    try {
        
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        console.log(resetPasswordToken);
        console.log(req.params.token);

        const user = await User.find({
            resetPasswordToken,
            resetPasswordExpire:{ $gt:Date.now() },
        })

        if(!user){
            return res.status(404).json({
                success:false,
                message:"Reset Password Token in invalid or has been expired",
            })
        }

        const {newpassword,confirmpassword} = req.body;
        if(newpassword !== confirmpassword){
            return res.status(404).json({
                success:false,
                message:"Confirm Password does not match",
            })
        }

        user.password = newpassword;
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({validateBeforeSave:false});

        const token = user.generateToken();

        return res.status(200).cookie("token",token,{
            expires:Date.now() + 60*24*60*60*1000,
            httpOnly:true,
        }).json({
            success:true,
            message:"Password has been updated successfully",
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//get user details (user)
exports.getUserDetails = async(req,res)=>{
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success:true,
            message:"User details are found",
            user,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}


//get user password
exports.updatePassword = async(req,res)=>{
    try {
        const user = await User.findById(req.user.id).select("+password");

        const {oldPassword,newPassword,confirmPassword} = req.body;
        
        const isMatch = await user.matchPassword(oldPassword);
        console.log(isMatch)
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Old Password does not matched",
            })
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Confirm Password does not matched",
            })
        }

        user.password = newPassword;
        await user.save();

        const token = await user.generateToken();
        res.status(200).cookie("token",token,{
            expires:new Date(Date.now() + 60*24*60*60*1000),
            httpOnly:true,
        }).json({
            success:true,
            message:"Password Updated Successfully",
            user,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

// update my profile
exports.updateProfile = async(req,res)=>{
    try {
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });
        const { name, email } = req.body;

        const user = await User.findByIdAndUpdate(req.user.id, {
            name,
            email,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({
            success:true,
            message:"Profile Updated in controller",
            user,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

// const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
//     folder: "avatars",
//     width: 150,
//     crop: "scale",
//   });

// const { name, email, password } = req.body;
// const user = await User.create({
//     name,
//     email,
//     password,
    
// });

//get all users (admin)
exports.getAllUsers = async(req,res)=>{
    try {
        const users = await User.find();

        res.status(200).json({
            success:true,
            message:"All users are found",
            users:users.reverse(),
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//get single user details (admin)
exports.getSingleUser = async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            })
        }
        res.status(200).json({
            success:true,
            message:"Single users is found",
            user,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

// update user Role to admin
exports.updateUserRole = async(req,res)=>{
    try {
        // console.log("BsController", req.body)
        const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true});

        await user.save();
        
        res.status(200).json({
            success:true,
            message:"Role Updated",
            user,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

// delete user (admin)
exports.DeleteProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);

        if(!user){
            return res.status(404).json({
                success:false,
                message:`User does not exist with id:${req.params.id}`,
            })
        }

        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);

        await user.deleteOne();
        
        res.status(200).json({
            success:true,
            message:"Profile Deleted",
            user,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

