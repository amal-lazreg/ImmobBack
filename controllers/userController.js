const User = require('../models/userModels');
const nodemailer = require('nodemailer');
const { LocalStorage } = require('node-localstorage');

const UserOTPVerification = require('../models/UserVerificationModel');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
const localStorage = new LocalStorage('./localStorage');


function storeUserInfo(username) {
    if (!username || typeof username !== 'string') {
      throw new Error('Nom d\'utilisateur invalide.');
    }
    
    localStorage.setItem('username', username);
  }





// Setup nodemailer transporter
let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587, // ou 465 pour le SSL
    secure: false, // true pour le port 465, false pour les autres ports
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
});

const signupController = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        console.log('Received signup request with:', { username, email, role });

        if (!username || !email || !password) {
            console.log('Missing fields');
            return res.status(400).json({ message: 'Ensure username, email, and password are provided' });
        }

        // Vérifier s'il existe déjà un utilisateur admin
        const adminUser = await User.findOne({ role: 'admin' });

        // Si un utilisateur admin existe déjà, tous les nouveaux utilisateurs doivent être des utilisateurs réguliers
        if (adminUser) {
            if (role === 'admin') {
                console.log('An admin user already exists. Only regular users can be created now.');
                return res.status(403).json({ message: 'An admin user already exists. Only regular users can be created now.' });
            }
        } else {
            // Si aucun utilisateur admin n'existe, permettre la création du premier admin
            if (role !== 'admin') {
                console.log('First user must be an admin.');
                return res.status(400).json({ message: 'First user must be created with the admin role.' });
            }
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('Username or email already exists');
            return res.status(400).json({ message: 'Username or email already exists!' });
        }

        // Définir le rôle de l'utilisateur. Les utilisateurs ne peuvent être que des utilisateurs réguliers après le premier admin.
        const userRole = adminUser ? 'user' : (role === 'admin' ? 'admin' : 'user');

        const user = new User({ username, email, password, role: userRole });

        const savedUser = await user.save();
        console.log('User saved:', savedUser);

        res.status(201).json({ message: 'User created successfully', user: savedUser });

        //await sendOTPVerificationEmail(savedUser, res);

    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).json({ message: 'An error occurred while creating the user' });
    }
};


const signinController = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).select('email username password role').exec();
        if (!user) {
            return res.status(401).json({ success: false, message: 'Could not authenticate user' });
        }

        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Could not authenticate password' });
        }

        const token = jwt.sign({ username: user.username, role: user.role }, secret, { expiresIn: '24h' });

        if (user.role === 'admin') {
            return res.json({ success: true, message: 'Admin authenticated', token: token, role: 'admin' });
        } else {
            return res.json({ success: true, message: 'User authenticated', token: token, role: 'user' });
        }
    } catch (err) {
        console.error('Error in signinController:', err);
        res.status(500).send(`An error occurred while authenticating the user: ${err.message}`);
    }
};

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${1000 + Math.floor(Math.random() * 9000)}`;
        console.log('Generated OTP:', otp);

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your Email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address</p><p>This code <b>expires in 1 hour</b>.</p>`,
        };

        // Hash the OTP
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        console.log('Hashed OTP:', hashedOTP);

        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        await newOTPVerification.save();

        await transporter.sendMail(mailOptions);

        res.json({
            status: "PENDING",
            message: "Verification OTP email sent",
            data: {
                userId: _id,
                email,
            },
        });
    } catch (error) {
        console.error('Error occurred in sendOTPVerificationEmail:', error);
        res.status(500).json({
            status: "FAILED",
            message: error.message,
        });
    }
};


const updateAdminProfile = async (req, res) => {
    try {
        const adminId = req.params._id;
        const { username, email, newPassword } = req.body;

        // Vérifier si l'utilisateur est un admin
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Mettre à jour le nom d'utilisateur
        if (username) {
            admin.username = username;
        }

        // Mettre à jour l'email
        if (email) {
            admin.email = email;
        }

        // Mettre à jour le mot de passe si fourni
        if (newPassword) {
            //const hashedPassword = await bcrypt.hash(newPassword, 10);
            admin.password = newPassword;
        }

        // Enregistrer les modifications
        await admin.save();

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getUserByIdController = async (req, res) => {
    try {
        const userId = req.params._id;
        const user = await User.findById(userId).select('-password').exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.error('Error in getUserByIdController:', err);
        res.status(500).json({ message: 'An error occurred while retrieving the user' });
    }
};


const getIdByUsername =  async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    try {
        // const userId = await getIdByUsername(username);
        const user = await User.$where(x=>x.username == userId);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


module.exports = {
    signupController,
    signinController,
    updateAdminProfile,
    getUserByIdController,
    getIdByUsername,
};
