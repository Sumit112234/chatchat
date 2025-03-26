const jwt = require("jsonwebtoken");
const User = require("../models/User");


const authenticate = async (req, res, next) => {
    const token = req?.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1];
    try {
        // console.log(req.cookies, req)
        
        // removeCookies(res);


        if (!token) {
            return res.status(401).json({
                message: "No token found",
                success: false,
                error: true,
                token,
                cookie : req.cookies
            });
        }


        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
      
        // console.log(decode);
        if(!decode)
        {
            return res.status(400).json({
                message: "Unauthorised Access.",
                success: false,
                error: true,
            });
        }
       
        const user = await User.findById(decode.userId);
        
        req.user = user; 
        // console.log(user);
        // console.log("decode -> ", decode);
        
        next();

    } catch (error) {
        return res.status(400).json({
            message: error.message || error,
            success: false,
            error: true,
            token : req.body,
           
        });
    }
};

module.exports = authenticate;
