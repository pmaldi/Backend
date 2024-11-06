const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Import de la connexion à la base de données
const connectDB = require('./utils/database');
connectDB();

// Import des routes
const quizRouter = require('./routes/v1/quiz');
const userRouter = require('./routes/v1/user');

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${req.ip}`);
    next();
})

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.use('/api/v1', quizRouter)
app.use('/api/v1/user', userRouter)


app.listen(4000, () => {
    console.log('Server is running on port 4000');
})