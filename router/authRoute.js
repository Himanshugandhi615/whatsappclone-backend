const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const authMiddleware = require("../middleware/auth-middlware");
const authvalidators = require("../validator/auth-validator");
const validate = require("../middleware/validate-middleware");
const multer = require('multer');

// Storage engine setup
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, '../server/public/profileuploads')
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
})
// File type filtering
const fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG files are allowed!'), false);
    }
}

const chatStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, '../server/public/chatuploads')
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const chatFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'audio/mpeg') {
        cb(null, true);
    } else {
        cb(new Error('Only image (JPEG/PNG), video, PDF, or MP3 files are allowed!'), false);
    }
}


const storyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, '../server/public/storyuploads');
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const storyFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image (JPEG/PNG) or video files are allowed!'), false);
    }
}


//middleware for upload file
const profileupload = multer({ storage: profileStorage, fileFilter: fileFilter });
const chatupload = multer({ storage: chatStorage,fileFilter: chatFilter});
const storyupload = multer({storage:storyStorage,fileFilter: storyFilter});

router.route("/signup").post(validate(authvalidators.signupSchema),authController.signUp);

router.route("/signin").post(validate(authvalidators.signinSchema),authController.signIn);

router.route("/user").get(authMiddleware,authController.getUser);

router.route("/getuserid").get(authMiddleware,authController.getUserId);

router.route("/getcontactlist").get(authMiddleware,authController.getContactList);

router.route("/edituserprofile").patch(authMiddleware,profileupload.single("file"),authController.editUserProfile);

router.route("/deleteprofileimage").delete(authMiddleware,authController.deleteProfileImage);

router.route("/save-chat").post(authMiddleware,chatupload.single("file"),authController.saveChat);

router.route("/getexistschats/:id").get(authMiddleware,authController.getExistsChats);

router.route("/getlastchat/:id").get(authMiddleware,authController.getLastChat);

router.route("/deletechat/:id").get(authMiddleware,authController.deleteChat);

router.route("/uploadstory").post(authMiddleware,storyupload.single("file"),authController.uploadStory);

router.route("/getstory").get(authMiddleware,authController.getStory);

router.route("/deletestory/:id").delete(authMiddleware,authController.deleteStory);

router.route("/getallstories").get(authMiddleware,authController.getAllStories);


module.exports = router;