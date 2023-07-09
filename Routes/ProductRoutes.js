const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getSingleProduct, createProductReview, getProductReviews, deleteReview } = require("../Controller/ProductController");
const { isAuthenticated, AuthorizeRoles } = require("../Middleware/Auth");
const Router = express.Router();

Router.route("/products").get(getAllProducts) //Done

Router.route("/admin/product/new").post(isAuthenticated,AuthorizeRoles("admin"),createProduct); //Done

Router.route("/admin/product/:id")
    .put(isAuthenticated,AuthorizeRoles("admin"),updateProduct) //done
    .delete(isAuthenticated,AuthorizeRoles("admin"),deleteProduct) //done
    
Router.route("/product/:id").get(getSingleProduct); //Done

Router.route("/review").put(isAuthenticated,createProductReview);

Router.route("/reviews")
    .get(isAuthenticated,getProductReviews) //Done
    .delete(isAuthenticated,deleteReview);

module.exports = Router