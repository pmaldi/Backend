const express = require('express');
const router = express.Router();
const quizModel = require('../../models/quiz.model');


// GET - Récuperer toutes les questions du quiz
router.get('/quiz', async (req, res) => {
    try {
        const quiz = await quizModel.find();
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// GET - Récuperer une question par son ID
router.get('/quiz/:id', async (req, res) => {
    try {
        const quiz = await quizModel.findOne({ id: req.params.id });
        if (!quiz) {
            return res.status(404).json({ error: "Question non trouvée" });
        }
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error });
    }
})

// POST - Ajouter une question
router.post('/quiz', async (req, res) => {
    const { id, question, options, answer } = req.body;
    const newQuiz = new quizModel({ id, question, options, answer });

    try {
        await newQuiz.save();
        res.status(201).json({ message: "Question crée avec succès", newQuiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// PUT - Modifier une question par son ID
router.put('/quiz/:id', async (req, res) => {
    const { question, options, answer } = req.body;

    try {
        const updatedQuiz = await quizModel.findOneAndUpdate({
            id: req.params.id
        }, {
            question, options, answer
        }, {
            new: true,
            runValidators: true
        });

        if (!updatedQuiz) {
            return res.status(404).json({ error: "Question non trouvée" });
        }

        res.status(201).json({ message: "Question crée avec succès", updatedQuiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// DELETE - Supprimer une question par son ID
router.delete('/quiz/:id', async (req, res) => {
    try {
        const deletedQuiz = await quizModel.findOneAndDelete({ id: req.params.id });
        if (!deletedQuiz) {
            return res.status(404).json({ error: "Question non trouvée" });
        }
        res.status(200).json({ message: "Question supprimée avec succès", deletedQuiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})


module.exports = router;