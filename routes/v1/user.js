const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcrypt');
const userModel = require('../../models/user.model');

router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // 1. Je regarde si mon utilisateur a un compte.
        const existingUser = await userModel.findOne({ email })
        // 2. si mon utilisateur a un compte je stop la.
        if (existingUser) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        //3. je hash le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. si il n'a pas de compte je crée le compte.
        const newUser = new userModel({
            username,
            email,
            password: hashedPassword
        })
        await newUser.save();
        res.status(201).json({ message: "Utilisateur crée avec succès", newUser });

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de l'utilisateur", error: error.message });
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Je verifie si l'utilisateur existe
        const user = await userModel.findOne({ email })
        // 2. si mon utilisateur existe pas je stop la
        if (!user) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }
        // 3. je compare mon mot de passe

        const isMatch = await bcrypt.compare(password, user.password); // false ou true
        // 4. je renvoi le resultat de ma comparaison
        if (!isMatch) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }
        // 5. je crée un token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" })

        res.status(200).json({ message: "Connexion réussie", token });

    } catch (error) {
        res.status(500).json({ message: "Une erreur est survenue lors de la connexion", error: error.message });
    }
})

router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Une erreur est survenue lors de la récupération de l'utilisateur", error: error.message });
    }

})

router.put('/update', async (req, res) => {
    const { email, username } = req.body;

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findByIdAndUpdate(decoded.id, { username, email }, { new: true });

        res.status(200).json({ message: "Utilisateur modifié avec succès", user });
    } catch (error) {
        res.status(500).json({ message: "Une erreur est survenue lors de la modification de l'utilisateur", error: error.message });
    }

})

router.delete('/delete', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const deletedUser = await userModel.findOneAndDelete(decoded.id);
        if (!deletedUser) {
            return res.status(404).json({ error: "Utilisateur non trouvée" });
        }

        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Une erreur est survenue lors de la suppression de l'utilisateur", error: error.message });
    }

})

module.exports = router;