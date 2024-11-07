const express = require('express');
const router = express.Router();
const { sendMailForm } = require('../controllers/mailController');

// Route pour envoyer le formulaire de contact
router.post('/mail', sendMailForm);

module.exports = router;
