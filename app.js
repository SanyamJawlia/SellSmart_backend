const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

if(process.env.MODE_ENV !== "production"){
    require("dotenv").config({path:"backend/config/config.env"});
}

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb',extended:true}));
app.use(cookieParser());





//importing Routes
const user = require("./Routes/UserRoutes");
const product = require("./Routes/ProductRoutes");
const order = require("./Routes/OrderRoutes");

//using routes
app.use("/api/v1",user)
app.use("/api/v1",product);
app.use("/api/v1",order)
app.use(cors({
  origin: 'http://localhost:3000'
}));


app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});

module.exports = app;