const jwt = require("jsonwebtoken");
const User = require("../models/users");
const authMiddleware = async (req, res, next) => {
  try {
    // const token = req.headers.authorization.replace("Bearer","").trim();
    // const token = req.headers.authorization.replace("Bearer ","");
    const token = req.headers.authorization.split(" ")[1];

    const isVerified = jwt.verify(token, process.env.SECRET_KEY);
    // console.log(isVerified);
    const user = await User.findOne({_id:isVerified._id},{password:0});
    req.token = token;
    req.user = user;
    req.userId = user._id;
    // Move on to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
}
module.exports = authMiddleware;