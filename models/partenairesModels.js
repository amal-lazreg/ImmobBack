const mongoose = require('mongoose');

const partenairesSchema = mongoose.Schema({
      
    photos: {
        type: [String],
        required: false,
    },
  
}) ; 

module.exports = mongoose.model('Partenaires', partenairesSchema);
