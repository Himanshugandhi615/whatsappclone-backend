const User = require("../models/users");
const Chat = require('../models/chats');
const Story = require("../models/stories");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const signUp = async (req, res) => {
    try {
        const existsuser = await User.findOne({ email: req.body.email });
        if (existsuser) {
            return res.status(409).json({ error: "Email already exists" });
        }
        const user = await User.create(req.body);
        const token = await user.generateAuthToken();
        res.status(200).json({ message: "Registration successfully", token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
const signIn = async (req, res) => {
    try {

        const existsuser = await User.findOne({ email: req.body.email });
        if (existsuser) {
            const isMatch = await bcrypt.compare(req.body.password, existsuser.password);
            if (isMatch) {
                const token = await existsuser.generateAuthToken();
                res.status(200).json({ message: "Login successful", token });
            }
            else {
                res.status(401).json({ error: "Invalid credentials" });
            }
        }
        else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const getUser = async (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
const getUserId = (req, res) => {
    try {
        res.status(200).json({ userid: req.userId });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
const getContactList = async (req, res) => {
    try {
        const contactlist = await User.find({ _id: { $nin: req.userId } }, { username: 1, image: 1,about: 1});
        res.status(200).json({ contactlist });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const editUserProfile = async (req, res) => {
    try {
        if (req.file) {
            if(req.user.image)
            {
                const filePath = path.join(__dirname, '../public/profileuploads', req.user.image);
                // Check if the file exists
                if (fs.existsSync(filePath)) {
                    // Remove the file
                    fs.unlinkSync(filePath);
                }
            }
            req.body.image = req.file.filename;
        }
        const updateduser = await User.findByIdAndUpdate({ _id: req.userId }, req.body, { new: true });
        res.status(200).json({ updateduser, message: "Update successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const deleteProfileImage = async (req, res) => {
    try {
        if (req.user.image !== "") {
            const filePath = path.join(__dirname, '../public/profileuploads', req.user.image);
            // Check if the file exists
            if (fs.existsSync(filePath)) {
                // Remove the file
                fs.unlinkSync(filePath);
            }
        }
        const updateduser = await User.findByIdAndUpdate({ _id: req.userId }, { image: "" }, { new: true });
        res.status(200).json({ updateduser, message: "delete successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const saveChat = async (req, res) => {
    try {
        if (req.file) {
            req.body.message = req.file.filename;
        }
        const c = await Chat.create(req.body);
        const chat = await Chat.findOne({ _id: c._id });
        res.status(200).json({ chat });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const getExistsChats = async (req, res) => {
    try {
        const id = req.params.id;
        const chats = await Chat.find({ $or: [{ sender_id: req.userId, receiver_id: id }, { sender_id: id, receiver_id: req.userId }] });
        res.status(200).json({ chats });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const getLastChat = async (req, res) => {
    try {
        const id = req.params.id;
        const chat = await Chat.find({ $or: [{ sender_id: req.userId, receiver_id: id }, { sender_id: id, receiver_id: req.userId }] }).sort({ createdAt: -1 }).limit(1);
        res.status(200).json({ chat:chat[0] });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}


const deleteChat = async (req, res) => {
    try {
        const id = req.params.id;
        const userchat = await Chat.findOne({ _id: id });
        if (userchat.type === "file") {
            const filePath = path.join(__dirname, '../public/chatuploads', userchat.message);
            // Check if the file exists
            if (fs.existsSync(filePath)) {
                // Remove the file
                fs.unlinkSync(filePath);
            }
        }
        const chat = await Chat.findByIdAndDelete({ _id: id });
        res.status(200).json({ chat });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const uploadStory = async (req, res) => {
    try {
        const story = await Story.create({ user_id: req.userId, content: req.file.filename });
        res.status(200).json({ message: "Story upload successfully", story: story });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const getStory = async (req, res) => {
    try {
        const story = await Story.aggregate([
            {
              $match: {
                user_id:new mongoose.Types.ObjectId(req.userId)
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$user_id",
                image: {
                  $first: "$user.image",
                },
                content: {
                  $push: {
                    content: "$content",
                    createdAt: "$createdAt",
                    _id: "$_id",
                  },
                },
                createdAt: {
                  $push: "$createdAt",
                },
              },
            },
            {
              $project: {
                _id: 1,
                story_id: 1,
                username: 1,
                image: 1,
                content: 1,
                createdAt: {
                  $arrayElemAt: ["$createdAt", -1],
                },
              },
            },
            {
              $addFields: {
                username: "My Status",
              },
            },
          ])
        res.status(200).json({story:story[0]});
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const deleteStory = async(req,res)=>{
    try{
        const id = req.params.id;
        const story = await Story.findOne({_id:id});
        if (story.content) {
            const filePath = path.join(__dirname, '../public/storyuploads',story.content);
            // Check if the file exists
            if (fs.existsSync(filePath)) {
                // Remove the file
                fs.unlinkSync(filePath);
            }
        }
        const mystory = await Story.findByIdAndDelete({_id:id});
        res.status(200).json({message:"Story delete successfully",story:mystory});
    }catch(error)
    {
        res.status(500).json({ error: "Internal server error" });
    }
}
const getAllStories = async (req, res) => {
    try {
        const allstories = await Story.aggregate([
            {
                $match: {
                    user_id: {
                        $ne: new mongoose.Types.ObjectId(req.userId),
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: "$user_id",
                    username: {
                        $first: "$user.username",
                    },
                    image: {
                        $first: "$user.image",
                    },
                    content: {
                        $push: { content: "$content", createdAt: "$createdAt" },
                    },
                    createdAt: {
                        $push: "$createdAt",
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    image: 1,
                    content: 1,
                    createdAt: {
                        $arrayElemAt: ["$createdAt", -1],
                    },
                },
            },
        ]);
        res.status(200).json({ allstories });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { getUser, signUp, signIn, getUserId, getContactList, editUserProfile, deleteProfileImage, saveChat,getLastChat, getExistsChats, deleteChat, uploadStory, getStory,deleteStory, getAllStories};
