const Mail = require('../models/mailModel');
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendMailForm = async (req, res) => {
    const { nom, prenom, email, message } = req.body;

    try {
        // Sauvegarde des données dans la base de données
        const newMail = new Mail({ nom, prenom, email, message });
        await newMail.save();

        // Configuration de l'envoi d'email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: email,
            to: 'lazregamal45@gmail.com',
            subject: `Nouveau message de ${nom} ${prenom}`,
            text: message,
        };

        // Envoi de l'email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.status(200).json({ message: 'Message envoyé avec succès!' });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    sendMailForm,
}
