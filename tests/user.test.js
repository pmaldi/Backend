const request = require('supertest');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const user = require('../routes/v1/user');
const userModel = require('../models/user.model');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/v1/user', user);

let mongoServer;
let token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri)

    const user = new userModel({
        username: "test",
        email: "test@test.fr",
        password: await bcrypt.hash("test", 10)
    })

    await user.save();
    token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
})

describe('Test API User', function () {

    it('should signup a new user', async () => {
        const res = await request(app)
            .post('/api/v1/user/signup')
            .send({
                username: "testIT",
                email: "testIT@email.fr",
                password: "testIT"
            })
        expect(res.statusCode).toEqual(201);
        expect(res.body.newUser).toHaveProperty('username', 'testIT');
    })

    it('should log in an existing user', async () => {
        const res = await request(app)
            .post('/api/v1/user/login')
            .send({
                email: "test@test.fr",
                password: "test"
            })
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    })

    it('should not log in a non-existing user', async () => {
        const res = await request(app)
            .post('/api/v1/user/login')
            .send({
                email: "error@test.fr",
                password: "error"
            })
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    })

    it('should delete an existing user', async () => {
        const res = await request(app)
            .delete('/api/v1/user/delete')
            .set("Authorization", `Bearer ${token}`)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Utilisateur supprimé avec succès');
    })

})