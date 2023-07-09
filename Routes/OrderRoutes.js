const express = require("express");
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require("../Controller/OrderController");
const {isAuthenticated, AuthorizeRoles} = require("../Middleware/Auth");
const Router = express.Router();

Router.route("/order/new").post(isAuthenticated,newOrder)  //Done

Router.route("/order/:id").get(isAuthenticated,AuthorizeRoles("admin"),getSingleOrder) // Done 

Router.route("/orders/me").get(isAuthenticated,myOrders); //Done

Router.route("/admin/orders").get(isAuthenticated,AuthorizeRoles("admin"),getAllOrders);  //Done

Router.route("/admin/order/:id")
    .put(isAuthenticated,AuthorizeRoles("admin"),updateOrder) // Done
    .delete(isAuthenticated,AuthorizeRoles("admin"),deleteOrder) //Done

module.exports = Router