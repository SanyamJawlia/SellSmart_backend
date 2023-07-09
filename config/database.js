const mongoose = require("mongoose")

exports.connectDatabase = ()=>{
    mongoose
        .connect(process.env.MONGO_URI) //usenewURLParser , unifiedTopology, usecreteindex
        .then((con)=>console.log(`Database Connected: ${con.connection.host}`))
        .catch((err)=>console.log(err));
}