const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String
    },
    image: {
        type: "String",
        default: ""
    },
    about: {
        type: "String",
        default: "Available"
    },
    password: {
        type: String
    }
}, {
    timestamps: true,
    versionKey: false
})

userSchema.methods.generateAuthToken = async function () {
    try {
        return jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY, { expiresIn: '30d' })
    } catch (err) {
        console.error(err);
    }
}

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

const User = new mongoose.model("User", userSchema);
module.exports = User;