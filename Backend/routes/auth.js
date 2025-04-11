const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/auth");
const router = express.Router();
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();




const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.SECRET_KEY_ACCESS_TOKEN, {
    expiresIn: "100m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.SECRET_KEY_REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const removeCookies = (res) => {
  res.cookie("accessToken",null);
  res.cookie("refreshToken",null);
};

const setCookies = (res, accessToken, refreshToken) => {
    
  
  res.cookie("accessToken", accessToken, {
        httpOnly : true,
        secure : true,
        sameSite : "None",
    maxAge: 15 * 60 * 10000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
        httpOnly : true,
        secure : true,
        sameSite : "None",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
};
// Signup
router.post("/signup", async (req, res) => {

    try{
      const { email, username, pic ,fullName, password } = req.body;

      // console.log({ email, username, pic ,fullName, password }, req.body )

      if(!email) return res.status(400).json({ message: "Email is required" });
    
      const checkUser = await User.findOne({ email });
      if (checkUser) return res.status(409).json({ message: "User already exists" });
    
      let salt = await bcryptjs.genSalt(13);
      let hashPass = await bcryptjs.hash(password,salt);
    
      
      const user = new User({ email, username, pic ,fullname : fullName, password :  hashPass });
      await user.save();
      // const token = jwt.sign({ user }, "secret_key", { expiresIn: "1h" });
       const { accessToken, refreshToken } = generateTokens(user._id);
      
       setCookies(res, accessToken, refreshToken);
            
       res.status(200).json({
        message: "User stored Successfully.",
        status : true,
        error : false,
        user ,
        accessToken,
        refreshToken
    })
    }
    catch(e)
    {
        res.status(500).json({
          message: "some internal server error occured.",
          status : false,
          error : true,
          e 
      })
    }
  
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;


  const user = await User.findOne({ email });
  if(!user)
    {
        return res.status(400).json({
            message: "No Email found! Please register.",
            success : false,
            error : true
        })
    }
    
  
              const cmp_password = await bcryptjs.compare(password,user.password);
      
              if(!cmp_password)
              {
                  return res.status(400).json({
                      message: "Incorrect Credientials.",
                      success : false,
                      error : true
                  })
              }
              console.log(user)
  const { accessToken, refreshToken } = generateTokens(user._id);
  setCookies(res, accessToken, refreshToken);



 
             res.status(200).json({
                message: "Login success.",
                success : true,
                error : false,
                user,
                accessToken,
                refreshToken,
                cookie : req.cookies
            })
});


router.get("/get-user",authenticate, async (req, res) => {  
  
  res.json({ user : req.user });
});
router.get("/get-all-users", async (req, res) => {  
  let users = await User.find({}).select("-password -__v").sort({ createdAt : -1 });

  res.status(200).json({ users });
});



router.get("/logout",authenticate, async (req, res) => {  
  try{
    removeCookies(res);
       
    return res.status(200).json({
            message: "Successfully logout.",
            success : true,
            error : false,
            cookies : req.cookies
        })
    
  
  }
  catch(e){
    res.status(400).json({
      message : "Unable to log out!",
      e 
    })
  }
});

module.exports = router;
