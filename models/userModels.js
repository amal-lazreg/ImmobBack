const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Définition du schéma de l'utilisateur
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' } ,
});

// Méthode pour comparer le mot de passe hashé
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Middleware pour hasher le mot de passe avant de sauvegarder
UserSchema.pre('save', function(next) {
    var user = this;

    const saltRounds = 10;

    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

module.exports = mongoose.model('User', UserSchema);
