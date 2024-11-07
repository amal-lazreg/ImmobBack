const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Définition du schéma de l'utilisateur
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

// Méthode pour comparer le mot de passe hashé
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Comparing passwords:', { candidatePassword, hashedPassword: this.password, isMatch });
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Middleware pour hasher le mot de passe avant de sauvegarder
UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    const saltRounds = 10;

    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

module.exports = mongoose.model('User', UserSchema);
