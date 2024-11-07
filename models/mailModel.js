const mongoose = require('mongoose');

const mailSchema = mongoose.Schema({
    nom: {
        type: String,
        required : true ,
    },
    prenom: {
        type: String,
        required : true ,
    },
    email: {
        type: String,
        required : true ,
    },
    message: {
        type: String,
        required : true ,
    },

})

module.exports = mongoose.model('Mail', mailSchema);
