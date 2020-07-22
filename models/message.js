const mongoose = require('mongoose');

const userMessage = new mongoose.Schema({
    user: String,
    message: String,
    time_date: String
}, {collection: 'chat'});

const SomeModel = mongoose.model('SomeModel', userMessage );
module.exports = SomeModel;