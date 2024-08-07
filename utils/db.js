const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://gandhihimanshu58:wbfS9Fvrgocyl3un@cluster0.rtzvz.mongodb.net/whatsapp?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
    console.log("connection is successfull");
}).catch((err)=>{
    console.log("No connection");
});