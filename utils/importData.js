require('dotenv').config();

const mongoose = require('mongoose');
const quizModel = require('../models/quiz.model'); // Assurez-vous que le chemin est correct
const userModel = require('../models/user.model'); // Importer le modèle User
const fs = require('fs');
const bcrypt = require('bcrypt');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, // obsolète, ça servait à éviter des erreurs de connexion
    useUnifiedTopology: true, // obsolète, ça servait à éviter des erreurs de connexion
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Lire le fichier JSON pour les questions de quiz
const questions = JSON.parse(fs.readFileSync('./assets/quiz.json', 'utf-8'));

// Créer deux utilisateurs génériques
const users = [
    {
        username: 'admin',
        email: 'admin@local.local',
        password: bcrypt.hashSync('admin', 10), // Hasher le mot de passe
    },
    {
        username: 'user',
        email: 'user@local.local',
        password: bcrypt.hashSync('user', 10), // Hasher le mot de passe
    }
];

// Fonction pour importer les données
const importData = async () => {
    try {
        // Remplacer ou insérer les questions de quiz
        for (const question of questions) {
            await quizModel.findOneAndUpdate(
                { id: question.id }, // Critère de recherche
                question,            // Données à mettre à jour
                { upsert: true, new: true } // Options: upsert true pour insérer si non trouvé
            );
        }

        // Remplacer ou insérer les utilisateurs
        for (const user of users) {
            await userModel.findOneAndUpdate(
                { email: user.email }, // Critère de recherche
                user,                  // Données à mettre à jour
                { upsert: true, new: true } // Options: upsert true pour insérer si non trouvé
            );
        }

        console.log('Données importées avec succès !');
        process.exit();
    } catch (error) {
        console.error('Erreur lors de l\'importation des données:', error);
        process.exit(1);
    }
};

// Exécuter l'importation
importData();
