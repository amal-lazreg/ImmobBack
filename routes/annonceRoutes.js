const express = require('express');
const router = express.Router();
const { getAllAnnonces, addAnnonce, deleteAnnonce, updateAnnonce,getAnnonceById } = require('../controllers/annonceController');
const upload = require('../config/upload');
const multer = require('multer');


router.get('/allAnnonces', getAllAnnonces);
// Route pour ajouter une annonce
router.post('/addAnnonce', upload.array('photos'), addAnnonce);
router.delete('/deleteAnnonce/:_id', deleteAnnonce);
router.put('/updateAnnonce/:_id', upload.array('photos'),updateAnnonce);
router.get('/annonces/:_id', getAnnonceById) ;

module.exports = router;
