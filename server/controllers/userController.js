import userModel from "../models/userModel.js";

const getUserData = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id)
      .select('-password -__v -createdAt -updatedAt -resetOtp -resetOtpExpireAt -verifyOtp -verifyOtpExpireAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    return res.json({
      success: true,
      user: { 
        _id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user data. Please try again later.'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

export default {
  getUserData,
  updateProfile
};
