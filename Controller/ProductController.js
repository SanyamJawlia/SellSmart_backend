const Product = require("../Model/ProductModel");
const User = require("../Model/UserModel");
const ApiFeatures = require("../Utils/ApiFeatures");
const cloudinary = require("cloudinary")

//createProduct ---admin
exports.createProduct = async(req,res)=>{
    try {

        let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
        req.body.user = req.user._id;

        const product = await Product.create(req.body);

        res.status(200).json({
            success:true,
            message:"New Product Created Successfully",
            product,
        })
    }
     catch (err) {
        res.status(500).json({
            success:false,
            err,
        })
    }
}

//get all products
exports.getAllProducts = async(req,res)=>{
    try {
        const resultPerPage = 20;
        const productCount = await Product.countDocuments();
        const apiFeature =new ApiFeatures(Product.find({}),req.query)
            .search()
            .filter()
            .pagination(resultPerPage);
        const products = await apiFeature.query;

        res.status(200).json({
            success:true,
            message:"All products are found",
            products,
            productCount,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
   }
}

//update product
exports.updateProduct = async(req,res)=>{
    try {
        const {name,description,price,Stock} = req.body;
        let product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"No Product found",
            })
        }

        product = await Product.findByIdAndUpdate(req.params.id,req.body);

        res.status(200).json({
            success:true,
            message:"Product is updated",
            product,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
   }
}

//delete Product 
exports.deleteProduct = async(req,res)=>{
    try {
        let product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"No Product found",
            })
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success:true,
            message:"Product is deleted",
            product,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//get single product
exports.getSingleProduct = async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id).populate("reviews.user");
        if(!product){
            return res.status(404).json({
                success:false,
                message:"No Product found",
            })
        }

        res.status(200).json({
            success:true,
            message:"Single Product is found",
            product,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//create review or update the review
exports.createProductReview = async(req,res)=>{
    try {
        const {rating,comment,productId} = req.body;

        const review = {
            user:req.user._id,
            name:req.user.name,
            rating:Number(rating),
            comment,
        }

        const product = await Product.findById(productId);

        const isReviewed = await product.reviews.find(rev=> rev.user.toString() === req.user._id.toString());
        if(isReviewed){
            product.reviews.forEach(rev=>{
                if(rev.user.toString() === req.user._id.toString()){
                    rev.rating = rating,
                    rev.comment = comment
                }
            })
        }
        else{
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        let avg = 0;
        product.reviews.forEach(rev=>{
            avg += rev.rating;
        })

        product.ratings = avg/product.numOfReviews;
        await product.save();

        res.status(200).json({
            success:false,
            message:"Review have been added or updated successfully",
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//get all reviews of a product
exports.getProductReviews = async(req,res)=>{
    try {
        const product = await Product.findById(req.query.id);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found",
            })
        }

        res.status(200).json({
            success:true,
            message:"All reviews of a product are found",
            reviews: product.reviews,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}

//delete Review
exports.deleteReview = async(req,res)=>{
    try {
        const product = await Product.findById(req.query.productId);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found",
            })
        }

        const reviews = product.reviews.filter(rev => rev._id.toString()!== req.query.id);
        console.log(reviews);
        const numOfReviews = reviews.length;
        let avg = 0;
        reviews.forEach(rev=>{
            avg += rev.rating;
        })
        let ratings=0;
        numOfReviews>0 ? ratings = avg/reviews.length : ratings=0;
        
        await Product.findByIdAndUpdate(req.query.productId,{reviews,ratings,numOfReviews},{new:true});

        res.status(200).json({
            success:true,
            message:"Review of product is deleted",
            reviews: product.reviews,
        })
    }
    catch (err) {
       res.status(500).json({
           success:false,
           message:err.message,
       })
    }
}