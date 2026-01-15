import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import {EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE} from '../config/emailTemplates.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'All fields are required' });
    }

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        // ✅ TOKEN
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // ✅ COOKIE
        res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        });


      // sending welcome email to user
const mailOptions = {
    from: `"Kenyatta National Hospital" <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: 'Welcome to Kenyatta National Hospital Digital Services',
    
    // Plain-text fallback (important)
    html: `
    <p>Dear ${user.name},</p>

    <p>
        Welcome to <strong>Kenyatta National Hospital (KNH) Digital Services</strong>.
    </p>

    <p>
        You have successfully logged into your KNH account. Our digital platform is designed to give you
        secure and convenient access to healthcare services, information, and innovations that support
        better patient care and experience.
    </p>

    <!-- ✅ THIS IS THE ONLY ADDITION -->
    <p>
        Your account has been created with email id:
        <strong>${user.email}</strong>.
    </p>

    <p>Through your account, you can:</p>
    <ul>
        <li>Access hospital-related digital services</li>
        <li>Receive important health and service notifications</li>
        <li>Stay informed about updates and innovations at KNH</li>
    </ul>

    <p>
        Your privacy and data security are very important to us. If you did not initiate this login or
        believe your account may be compromised, please contact our support team immediately.
    </p>

    <p>
        Thank you for trusting <strong>Kenyatta National Hospital</strong> — 
        <em>The Pride of African Healthcare</em>.
    </p>

    <p>
        Warm regards,<br>
        <strong>Kenyatta National Hospital</strong><br>
        Digital Health & Innovation Team<br>
        <a href="mailto:support@knh.or.ke">support@knh.or.ke</a><br>
        <a href="https://www.knh.or.ke">www.knh.or.ke</a>
    </p>
`
};
     
    await transporter.sendMail(mailOptions);


        return res.json({
            success: true,
            message: 'User registered and logged in successfully',
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


// controller function for user login
export const login=async (req, res) => {
    const { email, password } = req.body;
    //checking if the fields below in if statement are available
    if (!email || !password) {
        return res.json({success: false, message: 'Email and password fields are required'});
    }
    try {
        //checking existing usr with this email id
        const user= await UserModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User does not exist. invalid email' });
        }

        //comparing the password with hashed password in db
        const isMatch= await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        //generating the tokens using jwt
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        //using the cookie will send the response 
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            });


        return res.json({ success: true, message: 'User logged in successfully' });

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const logout=async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: 'User logged out successfully' });
    }
    catch (error) {
        res.json({success: false, message: error.message});
    }
}

//send verification OTP to user email
export const sendVerifyOtp=async (req, res) => {
    try{

        const userId = req.userId;
        //finding user from db
        const user= await UserModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success: false, message: 'Account is already verified'});
        }

        //generate OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        //save otp in database
        user.verifyOtp= otp;
        user.verifyOtpExpireAt= Date.now() + 24 * 60 * 60 * 1000;

        //save user in db
        await user.save();

        //send otp to user email
        const mailOptions = {
            from: `"Kenyatta National Hospital" <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: 'KNH Account Verification OTP',
            //    text: `Your verification OTP is: ${otp}. Verify your account using this OTP. It will expire in 24 hours.`,
            html: EMAIL_VERIFY_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email),
        }

        await transporter.sendMail(mailOptions);

        res.json({success: true, message: 'Verification OTP sent to your email'});


    }catch(error){
        res.json({success: false, message: error.message});
    }
}

//verify email using otp
export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userId = req.userId; 

    if (!otp) {
        return res.json({ success: false, message: 'OTP is required' });
    }

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

//check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try{

        return res.json({success: true, message: 'User is authenticated'});

    }catch(error){
        res.json({success: false, message: error.message});
    }
}

//send password reset OTP
export const sendResetOtp=async (req, res) => {
    const{email}= req.body;

    if(!email){
        return res.json({success: false, message: 'Email field is required'});
    }
    try{

        const user= await UserModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User with this email does not exist'});
        }

        //generate OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        //save otp in database
        user.resetOtp= otp;
        user.resetOtpExpireAt= Date.now() + 15 * 60 * 1000;

        //save user in db
        await user.save();

        //send otp to user email
        const mailOptions = {
            from: `"Kenyatta National Hospital" <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: 'Password Reset OTP',
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}", user.email),
        }

        await transporter.sendMail(mailOptions);
        res.json({success: true, message: 'Password reset OTP sent to your email'});

    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

//reset password using otp
export const resetPassword=async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: 'All fields are required: email, otp, newPassword'});
    }

    try{

        const user= await UserModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User with this email does not exist'});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP expired'});
        }

        //hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //update user password
        user.password= hashedPassword;
        user.resetOtp= '';
        user.resetOtpExpireAt= 0;

        await user.save();

        return res.json({success: true, message: 'Password reset successfully'});
 
    }catch(error){
        return res.json({success: false, message: error.message});
    }

};