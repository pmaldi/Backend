const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (array) {
                return array.length >= 2;
            },
            message: "Il faut au moins 2 options"
        }
    },
    answer: {
        type: String,
        required: true,
    }
})

const quizModel = mongoose.model('quizModel', quizSchema);

module.exports = quizModel;