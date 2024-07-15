const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes'); // Assurez-vous que le chemin d'accès est correct

const dotenv = require('dotenv');

dotenv.config();


app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', userRoutes); // Assurez-vous que userRoutes est correctement défini et exporté

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


