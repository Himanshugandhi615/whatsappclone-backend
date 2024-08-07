const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("connection is successfull");
}).catch((err)=>{
    console.log(err);
    console.log("No connection");
});