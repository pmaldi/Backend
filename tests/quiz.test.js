const request = require('supertest');
const express = require('express');
const quiz = require('../routes/v1/quiz');
const quizModel = require('../models/quiz.model');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use('/api/v1', quiz);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri)
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
})

describe('Test API Quiz', function () {
    it('should get all quiz questions', async () => {
        const res = await request(app).get('/api/v1/quiz'); // Envoie une requête GET pour récupérer toutes les questions de quiz
        expect(res.statusCode).toEqual(200); // Vérifie que le statut de la réponse est 200 (OK)
        expect(res.body).toEqual([]); // Vérifie que le corps de la réponse est un tableau vide
        //expect(res.body).toBeGreaterThan(0)
    });

    it('should get a single quiz by its ID', async () => {
        const question = new quizModel({
            id: "99",
            question: "Quelle est la capital de la France",
            options: ["Paris", "Londres", "Berlin", "Madrid"],
            answer: "Paris"
        });
        await question.save();
        const res = await request(app).get(`/api/v1/quiz/${question.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', question.id);
    })

    it('should create a new quiz question', async () => {
        const res = await request(app)
            .post('/api/v1/quiz')
            .send({
                id: "100",
                question: "Quelle est la capital de l'Espagne",
                options: ["Paris", "Londres", "Berlin", "Madrid"],
                answer: "Madrid"
            })
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Question crée avec succès')
        expect(res.body.newQuiz).toHaveProperty('id', '100');
    });

    it('should update a quiz by its ID', async () => {
        const question = new quizModel({
            id: "1",
            question: "Quelle est la capital de la France",
            options: ["Paris", "Londres", "Berlin", "Madrid"],
            answer: "Londres"
        });
        await question.save();
        const res = await request(app)
            .put(`/api/v1/quiz/${question.id}`)
            .send({
                id: "1",
                question: "Quelle est la capital de la France",
                options: ["Paris", "Londres", "Berlin", "Madrid"],
                answer: "Paris"
            })
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Question crée avec succès')
        expect(res.body.updatedQuiz).toHaveProperty('answer', 'Paris');
    })

    it('should delete a quiz by its ID', async () => {
        const question = new quizModel({
            id: "2",
            question: "Quelle est la capital de la France",
            options: ["Paris", "Londres", "Berlin", "Madrid"],
            answer: "Paris"
        });
        await question.save();

        const res = await request(app).delete(`/api/v1/quiz/${question.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Question supprimée avec succès');
    })
});