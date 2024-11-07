const express = require('express');
const router = express.Router();
const {getAllPartenaires,addPartenaire,deletePartenaire} = require('../controllers/partenairesController');
const upload = require('../config/upload');
const multer = require('multer');



router.get('/allPartenaires', getAllPartenaires);
router.post('/addPartenaires', upload.array('photos'), addPartenaire);
router.delete('/deletePartenaire/:_id', deletePartenaire);


module.exports = router;
