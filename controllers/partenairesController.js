const express = require('express');
const multer = require('multer');
const path = require('path');
const Partenaires = require('../models/partenairesModels'); 

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:\\Users\\lazre\\Desktop\\stage\\frontend\\src\\assets\\img'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

const addPartenaire = async (req, res) => {
    try {
        const photos = req.files.map(file => file.path); 
        let new_partenaire = new Partenaires({
            photos: photos,
        });
        await new_partenaire.save();
        res.status(200).send({message : 'Partenaire ajouté avec succé'});
    } catch (err) {
        console.log(err);
        res.status(500).send({message :"Erreur lors de l'ajout de partenaire"});
    }
};

const getAllPartenaires = async (req, res) => {
    try {
        const partenaires = await Partenaires.find({});
        res.json(partenaires);
    } catch (err) {
        console.log(err);
        res.status(500).send("Erreur lors de la récupération des partenaires");
    }
};


const deletePartenaire = async (req, res) => {
    try {
        await Partenaires.findOneAndDelete({ _id: req.params._id });
        res.status(200).send({message : ' Partner deleted successfully'});
    } catch (err) {
        console.log(err);
        res.status(500).send("Erreur lors de la suppression de l'annonce");
    }
};


module.exports = {
    addPartenaire,
    getAllPartenaires,
    deletePartenaire,
}
