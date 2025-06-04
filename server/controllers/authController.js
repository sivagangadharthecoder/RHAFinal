import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transport from "../config/nodemailer.js";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const getCookieOptions = (req) => {
    const isLocalhost = req.headers.origin?.includes('localhost');
    const isRender = req.headers.origin?.includes('onrender.com');
    
    return {
        httpOnly: true,
        secure: true, 
        sameSite: isLocalhost ? "lax" : "none", 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        domain: isLocalhost ? undefined : ".onrender.com", 
        path: "/"
    };
};

const sendEmail = async (mailOptions) => {
    return new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, (error, info) => {
            if (error) reject(error);
            else resolve(info);
        });
    });
};

export const register = async (req, res) => {
    const { name, rollNumber, email, password } = req.body;

    try {
        if (!name || !rollNumber || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            name,
            rollNumber,
            email,
            password: hashedPassword
        });

        const token = generateToken(user._id);
        res.cookie("token", token, getCookieOptions(req));

        await sendEmail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🎉 Welcome to RequestHub - Your Campus Request Solution",
            text: `Hi ${name},\n\nWelcome to RequestHub! We're thrilled to have you join our platform that simplifies request management for students like you.\n\nWith RequestHub, you can now:\n- Submit ID card, leave, and event requests in minutes\n- Track all your requests in one place\n- Get real-time status updates\n\nGet started now by logging in to your account.\n\nBest regards,\nThe RequestHub Team`,
            html: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #2F54;
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                padding: 30px 20px;
                background-color: #f9f9f9;
            }
            .feature {
                margin-bottom: 20px;
                padding: 15px;
                background-color: white;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .cta-button {
                display: inline-block;
                background-color: #2F54;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #ffffff;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to RequestHub, ${name}!</h1>
            <p>Your all-in-one platform for campus requests</p>
        </div>
        
        <div class="content">
            <p>We're excited to have you join our community of students who are simplifying their request processes.</p>
            
            <div class="feature">
                <h3>📝 Easy Request Submission</h3>
                <p>Submit requests for ID cards, leaves, hackathons, and more with just a few clicks.</p>
            </div>
            
            <div class="feature">
                <h3>📊 Real-time Tracking</h3>
                <p>Monitor your forms with clear indicators for approved, rejected, or pending statuses.</p>
            </div>
            
            <div class="feature">
                <h3>🔔 Instant Notifications</h3>
                <p>Get email updates when there's an update to your request status.</p>
            </div>
            
           
            
            <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} RequestHub. All rights reserved.</p>
            <p>RequestHub - Streamlining your campus experience</p>
        </div>
    </body>
    </html>
    `
        });

        return res.json({
            success: true,
            message: "Registration successful"
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    const { rollNumber, email, password } = req.body;

    try {
        if (!rollNumber || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const user = await userModel.findOne({ rollNumber, email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = generateToken(user._id);
        res.cookie("token", token, getCookieOptions(req));

        return res.json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                rollNumber: user.rollNumber,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/"
    });

    return res.json({
        success: true,
        message: "Logout successful"
    });
};

export const sendVerifyOtp = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;

        await user.save();

        const { email, name } = user;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🔐 Verify Your RequestHub Account",
            text: `Hi ${name},\n\nWelcome to RequestHub!\n\nYour OTP is ${otp}. It is valid for 10 minutes.\n\nThanks,\nRequestHub Team`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hi ${name},</h2>
                    <p>🎉 <strong>Welcome to RequestHub!</strong> We're thrilled to have you with us.</p>
                    <p>Please use the OTP below to verify your account. This code is valid for <strong>10 minutes</strong>:</p>
                    <div style="font-size: 22px; font-weight: bold; color: #2F54EB; background-color: #F0F4FF; padding: 12px 24px; width: fit-content; border-radius: 8px; border: 1px solid #d6e4ff;">
                        ${otp}
                    </div>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br/>
                    <p>Warm regards,</p>
                    <p><strong>The RequestHub Team</strong></p>
                </div>
            `
        };

        await new Promise((resolve, reject) => {
            transport.sendMail(mailOptions, (error, info) => {
                if (error) return reject(error);
                resolve(info);
            });
        });

        return res.status(200).json({
            success: true,
            message: "Verification email sent successfully.",
        });

    } catch (error) {
        console.error("Error in sendVerifyOtp:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An unexpected error occurred.",
        });
    }
};

export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "Missing Details" });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }

        if (user.verifyOtp !== otp || user.verifyOtp === '') {
            return res.status(400).json({ success: false, message: "Invalid OTP!" });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired!" });
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Account verified successfully!" });

    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Please provide an email address" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🔐 Reset Your RequestHub Password",
            text: `Hi ${user.name},\n\nYour OTP for password reset is ${otp}. It is valid for 10 minutes.\n\nThanks,\nRequestHub Team`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hi ${user.name},</h2>
                    <p>We received a request to reset your password.</p>
                    <p>Your OTP for password reset is:</p>
                    <div style="font-size: 22px; font-weight: bold; color: #2F54EB; background-color: #F0F4FF; padding: 12px 24px; width: fit-content; border-radius: 8px; border: 1px solid #d6e4ff;">
                        ${otp}
                    </div>
                    <p>This code is valid for <strong>10 minutes</strong>.</p>
                    <p>If you didn’t request this, please ignore this email.</p>
                    <br/>
                    <p>Warm regards,</p>
                    <p><strong>The RequestHub Team</strong></p>
                </div>
            `
        };

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to send reset OTP email.",
                });
            }

            console.log("Reset OTP email sent:", info.response);
            return res.status(200).json({
                success: true,
                message: "Reset OTP sent successfully to your email.",
            });
        });

    } catch (err) {
        console.error("Error in sendResetOtp:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }

        if (user.resetOtp !== otp || user.resetOtp === '') {
            return res.status(400).json({ success: false, message: "Invalid OTP!" });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password reset successfully!" });

    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const sendResetOtp2 = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Please provide an email address" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🔐 Reset Your RequestHub Password",
            text: `Hi ${user.name},\n\nYour OTP for changing username is ${otp}. It is valid for 10 minutes.\n\nThanks,\nRequestHub Team`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hi ${user.name},</h2>
                    <p>We received a request to change your username.</p>
                    <p>Your OTP for changing username is:</p>
                    <div style="font-size: 22px; font-weight: bold; color: #2F54EB; background-color: #F0F4FF; padding: 12px 24px; width: fit-content; border-radius: 8px; border: 1px solid #d6e4ff;">
                        ${otp}
                    </div>
                    <p>This code is valid for <strong>10 minutes</strong>.</p>
                    <p>If you didn’t request this, please ignore this email.</p>
                    <br/>
                    <p>Warm regards,</p>
                    <p><strong>The RequestHub Team</strong></p>
                </div>
            `
        };

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to send reset OTP email.",
                });
            }

            console.log("Reset OTP email sent:", info.response);
            return res.status(200).json({
                success: true,
                message: "Reset OTP sent successfully to your email.",
            });
        });

    } catch (err) {
        console.error("Error in sendResetOtp:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const changeUsername = async (req, res) => {
    const { email, otp, newUsername } = req.body;

    if (!email?.trim() || !otp?.trim() || !newUsername?.trim()) {
        return res.status(400).json({
            success: false,
            message: "All fields are required and cannot be empty"
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with this email"
            });
        }

        if (!user.resetOtp || user.resetOtp === '') {
            return res.status(400).json({
                success: false,
                message: "No OTP was generated for this account"
            });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP entered"
            });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one"
            });
        }

        if (user.name === newUsername) {
            return res.status(400).json({
                success: false,
                message: "New username cannot be same as current username"
            });
        }

        user.name = newUsername;
        user.resetOtp = '';
        user.resetOtpExpireAt = null;

        await user.save();

        return res.json({
            success: true,
            message: "Username changed successfully!",
            newUsername
        });

    } catch (error) {
        console.error("Username change error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during username change"
        });
    }
};
