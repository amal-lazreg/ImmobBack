const User = require('../models/userModels');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const UserOTPVerification = require('../models/UserVerificationModel');
const dotenv = require('dotenv');
const SMTPConnection = require("nodemailer/lib/smtp-connection");
let connection = new SMTPConnection(SMTPConnection);

require('dotenv').config();



let poolConfig = "smtps://username:password@smtp.example.com/?pool=true";

const secret = process.env.JWT_SECRET;

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


console.log('AUTH_EMAIL:', process.env.AUTH_EMAIL);
console.log('AUTH_PASS:', process.env.AUTH_PASS);

const signupController = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log('Received signup request with:', { username, email });

        if (!username || !email || !password) {
            console.log('Missing fields');
            return res.status(400).json({ message: 'Ensure username, email, and password are provided' });
        }

        if (username === 'admin') {
            console.log('Cannot create admin user through signup');
            return res.status(403).json({ message: 'Cannot create admin user through signup' });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('Username or email already exists');
            return res.status(400).json({ message: 'Username or email already exists!' });
        }

        const user = new User({ username, email, password, role: 'user' });

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

        // Recherche de l'utilisateur par nom d'utilisateur
        const user = await User.findOne({ username }).select('email username password role').exec();
        console.log(user)
        if (!user) {
            console.log('User not found:', username);
            return res.json({ success: false, message: 'Could not authenticate user' });
        } 

        // Vérification du mot de passe
        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            console.log('Invalid password for user:', username);
            return res.json({ success: false, message: 'Could not authenticate password' });
        }

        // Génération du jeton JWT
        const token = jwt.sign({ username: user.username, role: user.role }, secret, { expiresIn: '24h' });
        console.log('User authenticated:', username);
        
        // Redirection en fonction du rôle
        if (user.role === 'admin') {
            return res.json({ success: true, message: 'Admin authenticated', token: token, role: 'admin' });
            // Redirection ou réponse pour l'interface admin
        } else {
            return res.json({ success: true, message: 'User authenticated', token: token, role: 'user' });
            // Redirection ou réponse pour l'interface utilisateur
        }
        
    } catch (err) {
        console.error('Error occurred during authentication:', err);
        res.status(500).send('An error occurred while authenticating the user');
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

async function createAdmin() {
    const adminUsername = 'admin';
    const adminEmail = 'admin@example.com';
    const adminPassword = 'password'; 

    try {
        const existingAdmin = await User.findOne({ username: adminUsername });
        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

        const admin = new User({
            username: adminUsername,
            password: hashedPassword,
            email: adminEmail,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}



createAdmin();

module.exports = {
    signupController,
    signinController,
};
