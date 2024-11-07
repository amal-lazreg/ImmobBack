const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes'); 
const annonceRoutes = require('./routes/annonceRoutes'); 
const partenaireRoutes = require('./routes/partenairesRoutes');
const mailRoutes = require('./routes/mailRoutes');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/userModels');  
const bcrypt = require('bcrypt');



dotenv.config();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploadsaa', express.static(path.join(__dirname, 'uploads')));
// Augmenter la limite de la taille de la charge utile
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Ou avec express.json si vous utilisez la méthode recommandée pour Express 4.16.0 et plus
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const multer = require('multer');
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});


app.use('/api', userRoutes); 
app.use('/api', annonceRoutes); 
app.use('/api', partenaireRoutes); 
app.use('/api', mailRoutes); 




mongoose.connect('mongodb://localhost:27017/agence')
    .then(() => {
        console.log('Connexion à la base de données réussie');
    })
    .catch((error) => {
        console.error('Erreur de connexion à la base de données:', error);
    });


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
