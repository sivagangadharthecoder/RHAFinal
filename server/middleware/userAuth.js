import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token missing. Please login again." 
      });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await userModel.findById(tokenDecode.id)
      .select('-password -__v -resetOtp -resetOtpExpireAt -verifyOtp -verifyOtpExpireAt');
    
    if (!user) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/"
      });
      
      return res.status(401).json({ 
        success: false, 
        message: "User not found. Please login again." 
      });
    }

    req.user = user;
    req.rollNumber = user.rollNumber;
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
    let errorMessage = "Authentication failed";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Session expired. Please login again.";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Invalid token. Please login again.";
    }
    
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    });
    
    return res.status(401).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};

export default userAuth;
