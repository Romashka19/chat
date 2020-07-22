const express = require('express');
const messageModel = require('../models/message');
const bodyParser= require('body-parser')
const app = express();

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/messages', async (req, res) => {
    const messg = await messageModel.find({});
    try {
        res.send(messg);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/upload', async (req, res) => {
    console.log(req.body)
    const messg = new messageModel(req.body);
    try {
        await messg.save();
        res.send(messg);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = app;