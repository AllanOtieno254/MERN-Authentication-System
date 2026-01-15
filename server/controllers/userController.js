import userModel from '../models/userModel.js';

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId; // comes from auth middleware

    const user = await userModel
      .findById(userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
      },
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
