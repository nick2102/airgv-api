const express       = require('express');
const Station    = require('../models/Station');
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
    const localToken = '@7)4y266DKh5Xc(gXbN.*B9';

    try {
        const requestToken = req.body.token;

        if(!requestToken || requestToken !== localToken){
            return res.status(401).send({ isValid: false, error: 'Unauthorized request' });
        }

        const stationName = req.body.data.info.station;
        const year  = req.body.data.info.year;
        const month  = req.body.data.info.month;
        const day  = req.body.data.info.day;
        const station = await Station.findOne({ station_name: stationName, year: year });

        if(!station) {
            const newStation = new Station({
                station_name: stationName,
                year: year,
                aqi: await Station.generateAqiData(req.body)
            });
            const createdStation = await newStation.save();

            return res.send({ isValid: true, data: createdStation });
        }

        const currentDay = station['aqi'][month][day];

        if(!currentDay){
            station['aqi'][month][day] = [];
        }

        const a = req.body.data.info.time.split(':'); // split it at the colons
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);

        try {
            station['aqi'][month][day].unshift({ pm10 : req.body.data.aqi.pm10, pm25 : req.body.data.aqi.pm25, time : req.body.data.info.time, seconds: seconds })
            station.markModified('aqi');
            station.save();
            return res.send({ isValid: true, data: station });
        } catch (e) {
            res.status(500).send({ isValid: false, error: e });
        }

    } catch (e) {
        res.status(500).send({ isValid: false, error: e });
    }
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