const express = require('express');
const multer = require('multer');
const path = require('path');
const Annonce = require('../models/annonceModels'); 

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



const addAnnonce = async (req, res) => {
    try {
        const photos = req.files.map(file => file.path); 
        let new_annonce = new Annonce({
            titre: req.body.title, 
            description: req.body.description,
            adresse: req.body.address,
            type: req.body.type,
            prix: req.body.price,
            surface: req.body.surface,
            disponibilite: req.body.disponibilite,
            coordonnes: req.body.coordonnee,
            transactionType: req.body.transactionType,
            photos: photos,
        });
        await new_annonce.save();
        res.status(200).send({message : 'Announcement added successfully'});
    } catch (err) {
        console.log(err);
        res.status(500).send({message :"Erreur lors de l'ajout de l'annonce"});
    }
};



const getAllAnnonces = async (req, res) => {
    try {
        const annonces = await Annonce.find({});
        res.json(annonces);
    } catch (err) {
        console.log(err);
        res.status(500).send("Erreur lors de la récupération des annonces");
    }
};


const deleteAnnonce = async (req, res) => {
    try {
        await Annonce.findOneAndDelete({ _id: req.params._id });
        res.status(200).send({message : ' Announcement deleted successfully'});
    } catch (err) {
        console.log(err);
        res.status(500).send("Erreur lors de la suppression de l'annonce");
    }
};

const updateAnnonce = async (req, res) => {
        try {
            let updateData = {
                titre: req.body.titre,
                description: req.body.description,
                adresse: req.body.adresse,
                type: req.body.type,
                prix: req.body.prix,
                surface: req.body.surface,
                disponibilite: req.body.disponibilite,
                coordonnes: req.body.coordonnees,
            };
    
            if (req.files && req.files.length > 0) {
                const photos = req.files.map(file => file.path);
                updateData.photos = photos;
            }
    
            const updatedAnnonce = await Annonce.findOneAndUpdate(
                { _id: req.params._id }, 
                { $set: updateData }, 
                { new: true } 
            );
            res.status(200).send({message : ' Announcement updated successfully'});
        } catch (err) {
            console.log(err);
            res.status(500).send({message :"An error occurred while updating the announcement"});

        }
    };


    const getAnnonceById = async(req,res) =>{
        try {
            const annonce = await Annonce.findById(req.params._id);
            if (!annonce) {
                return res.status(404).json({ message: 'Annonce non trouvée' });
            }
            res.json(annonce);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }

    }

module.exports = {
    getAllAnnonces,
    addAnnonce,
    upload,
    deleteAnnonce,
    updateAnnonce,
    getAnnonceById,
};
