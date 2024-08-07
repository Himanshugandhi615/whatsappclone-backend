const {z} = require("zod");

//creating an object schema
const signupSchema = z.object({
    username:z
    .string({required_error:"Name is required"})
    .trim()
    .min(3,{message:"Name must be atleast 3 characters"}),
    email:z
    .string({required_error:"Email is required"})
    .trim()
    .email({message:"Invalid email address"})
    .min(3,{message:"Email must be atleast 3 characters"})
    .max(255,{message:"Email must not be more than 255 characters"}),
    phone:z
    .string({required_error:"Phone number is required"})
    .min(10,{message:"Phone number must be atleast 3 digits"})
    .max(20,{message:"Phone number must not be more than 20 digits"}),
    password:z
    .string({required_error:"password is required"})
    .min(5,{message:"Password must be atleast 5 characters"})
    .max(1024,{message:"Password can't be greater than 1024 characters"}),
})

const signinSchema = z.object({
    email:z
    .string({required_error:"Email is required"})
    .trim()
    .email({message:"Invalid email address"})
    .min(3,{message:"Email must be atleast 3 characters"})
    .max(255,{message:"Email must not be more than 255 characters"}),
    password:z
    .string({required_error:"password is required"})
})

module.exports = {signupSchema,signinSchema};