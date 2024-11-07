const mongoose = require('mongoose');

const annonceSchema = mongoose.Schema({
    titre: {
        type: String,
        required : true ,
    },
    description: {
        type: String,
        required : true ,
    },
    adresse: {
        type: String,
        required : true ,
    },
    type: {
        type: String,
        required : true ,
    },
    prix: {
        type: String,
        required : true ,
    },
    surface: {
        type: String,
        required : true ,
    },
    disponibilite: {
        type: String,
        required : true ,
    },
    coordonnes: {
        type: String,
        required : true ,
    },
    transactionType: {
        type: String,
        required: true,
        enum: ['a vendre', 'a louer'] 
    },
    photos: {
        type: [String],
        required: false,
    },
  
}) ; 

module.exports = mongoose.model('Annonces', annonceSchema);
