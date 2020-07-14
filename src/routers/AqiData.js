const express       = require('express');
const fs = require('fs');
const Station    = require('../models/Station');
const Aqi    = require('../models/Aqi');
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
    const localToken = '@7)4y266DKh5Xc(gXbN.*B9';

    try {
        const requestToken = req.body.token;

        if(!requestToken || requestToken !== localToken){
            return res.status(401).send({ isValid: false, error: 'Unauthorized request' });
        }

        const stationName = req.body.data.info.station;
        const station = await Station.findOne({ name: stationName });

        if(!station) {
            const newStation = new Station({ name: stationName });
            const stationID = await newStation.save();
            const aqiData = await Aqi.generateAqiData(stationID, req.body);
            const newAqi = new Aqi(aqiData);
            await newAqi.save();

            return res.send({ isValid: true, data: newAqi });
        }

        const aqi = await Aqi.findOne({ station_id:  station._id});

        if(!aqi) {
            const aqiData = await Aqi.generateAqiData(station, req.body);
            const newAqi = new Aqi(aqiData);
            await newAqi.save();

            return res.send({ isValid: true, data: newAqi });
        }

        const currentDate = req.body.data.info.date;
        const day = currentDate.split('.')[0];
        const month = currentDate.split('.')[1];
        const year = currentDate.split('.')[2];
        const measurements = aqi.year[year][month][day];
        const seconds = await Aqi.timeToSeconds(req.body.data.info.time);

        if(!measurements){
            aqi.year[year][month][day] = {};
            aqi.year[year][month][day][seconds] = { pm10 : req.body.data.aqi.pm10, pm25 : req.body.data.aqi.pm25, time : req.body.data.info.time, seconds: seconds }
            aqi.markModified('year');
            await aqi.save();
            return res.send({ isValid: true, data: aqi });
        }

        aqi.year[year][month][day][seconds] = { pm10 : req.body.data.aqi.pm10, pm25 : req.body.data.aqi.pm25, time : req.body.data.info.time, seconds: seconds };
        aqi.markModified('year');
        await aqi.save();

        return res.send({ isValid: true, data: aqi });

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