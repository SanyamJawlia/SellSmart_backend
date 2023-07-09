const express = require("express");
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getSingleUser, getAllUsers, updateUserRole, DeleteProfile } = require("../Controller/UserController");
const { isAuthenticated, AuthorizeRoles } = require("../Middleware/Auth");
const Router = express.Router();

Router.route("/register").post(registerUser) //Done

Router.route("/login").post(loginUser) //Done

Router.route("/logout").get(isAuthenticated,logout) // Done

Router.route("/password/forgot").post(isAuthenticated,forgotPassword)

Router.route("/password/reset/:token").put(isAuthenticated,resetPassword);

Router.route("/me").get(isAuthenticated,getUserDetails); //Done

Router.route("/password/update").put(isAuthenticated,updatePassword); // Done

Router.route("/me/update").put(isAuthenticated,updateProfile); // Done

Router.route("/admin/users").get(isAuthenticated,AuthorizeRoles("admin"),getAllUsers) //Done

Router.route("/admin/user/:id")
    .get(isAuthenticated,AuthorizeRoles("admin"),getSingleUser) //Done
    .put(isAuthenticated,AuthorizeRoles("admin"),updateUserRole) // Done
    .delete(isAuthenticated,AuthorizeRoles("admin"),DeleteProfile)

    
module.exports = Router