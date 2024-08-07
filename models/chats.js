const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    sender_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    receiver_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    message:{
        type:String
    },
    type:{
        type:String,
        default:"text"
    }
},{
    timestamps: true,
    versionKey:false
})

module.exports = mongoose.model("Chat",chatSchema);