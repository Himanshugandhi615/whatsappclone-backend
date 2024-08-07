const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    content:{
        type:String
    }
    
},{
    timestamps: true,
    versionKey:false
})

module.exports = mongoose.model("Story",storySchema);