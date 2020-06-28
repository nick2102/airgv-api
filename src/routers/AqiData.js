const express       = require('express');
const fs = require('fs');
const Station    = require('../models/Station');
const Aqi    = require('../models/Station');
const Test = require('../models/Test');
const router        = new express.Router();

//Home route info
router.get('/', async (req, res) =>{
    try {
        const routes = {
            isValid: true,
            info: 'AirGostivar list of public API endpoints',
            endpoints: [
                { name : 'Info Route', endpoint : '/', method: 'get', description: 'N/A' },
                { name : 'Current Aqi Data', endpoint : '/current', method: 'get', description: 'N/A' }
            ]
        };
        res.send(routes);
    } catch (e) {
        res.status(400).send({ isValid: false, error: e });
    }
});

// Get current Air Quality
router.get('/current', async (req, res) => {
    try {
        res.send({ isValid: true, status: 'OK' });
    } catch (e) {
        res.status(400).send({ isValid: false, error: e });
    }
});

//Save measurements
router.post('/save-measurements', async (req, res) =>{
    res.status(201).send({test : "test"});
});

//test Route post
router.post('/save-test', async (req, res) => {
    const test = new Test(req.body);

    try {
        await test.save();
        const response = {
            isValid: true,
            test: test
        }
        res.status(201).send(response);
    } catch (e) {
        res.status(400).send({ isValid: false, error: e });
    }
});

router.get('*', async (req, res) => {
    res.send({ isValid: false, error: 'Unknown endpoint!' });
});

module.exports = router;