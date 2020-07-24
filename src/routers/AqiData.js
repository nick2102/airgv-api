const express       = require('express');
const Station    = require('../models/Station');
const router        = new express.Router();
const moment = require('moment');
const momentTz = require('moment-timezone');

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
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1) > 9 ? today.getMonth() + 1 : '0' + ( today.getMonth() + 1 );
    const day = today.getDate() > 9 ? today.getDate() : '0' + today.getDate();
    const stationName = req.query.stationId && req.query.stationId !=='' ? req.query.stationId : false;
    const allMeasurements = req.query.all_day && req.query.all_day === 'true';
    let errorData = {
        errorNo: "001",
        error: "Station not active at the moment.",
        data:  {
            "pm10": "N/A",
            "pm25": "N/A",
            "time": "N/A",
            "seconds": "N/A"
        }
    };
    let query = { year: year }

    if(stationName){
        query['station_name'] = stationName;
    }

    try {
        const stations = stationName ? await Station.findOne(query) : await Station.find(query);
        const currentTime = await Station.timeFormat(today);
        const currentSeconds = await Station.timeToSeconds(currentTime);

        if(!stations) {
            return res.status(404).send({ isValid: false, error: "No data found." });
        }

        if(stationName) {
            const currentAqi = stations['aqi'][month][day];

            if(!currentAqi) {
                errorData['station_name'] = stationName;
                return res.send(errorData);
            }

            if(currentAqi[0].seconds + 120 < currentSeconds) {
                errorData['station_name'] = stationName;
                return res.send(errorData);
            }

            return res.send({ isValid: true, data:  allMeasurements ? currentAqi : currentAqi[0] });
        }

        const aqi = stations.map( (station) => {
            const currentAqi = station['aqi'][month][day];

            if(!currentAqi) {
                errorData['station_name'] = station.stationId;
                return errorData;
            }

            if(currentAqi[0].seconds + 120 < currentSeconds) {
                errorData['station_name'] = station.stationId;
                errorData['station_name'] = station.stationId;
                return errorData;
            }

             return {
                 station_name : station.stationId,
                 aqi: allMeasurements ? currentAqi : currentAqi[0]
             }
        });

        return res.send({ isValid: true, data: aqi });

    } catch (e) {
        return res.status(400).send({ isValid: false, error: e });
    }
});

// Get current Air Quality My Air
router.get('/measurements/public', async (req, res) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1) > 9 ? today.getMonth() + 1 : '0' + ( today.getMonth() + 1 );
    const day = today.getDate() > 9 ? today.getDate() : '0' + today.getDate();
    const stationId = req.query.stationId && req.query.stationId !=='' ? req.query.stationId : false;
    const currentTime = await momentTz.tz("Europe/Skopje").format('HH:mm:ss');
    const currentSeconds = await Station.timeToSeconds(currentTime);

    let query = { year: year }

    try {
        const stations = await Station.find(query);
        const currentTime = await Station.timeFormat(today);
        const currentSeconds = await Station.timeToSeconds(currentTime);

        if(!stations) {
            return res.status(404).send({ isValid: false, error: "No data found." });
        }

        const timeNow = await Station.timeToSeconds(momentTz.tz("Europe/Skopje").format('HH:mm:ss'));
        // const timeNow = await Station.timeToSeconds('22:12:16');
        const timeHourAgo = await Station.timeToSeconds(moment(momentTz.tz("Europe/Skopje").format()).subtract(1, 'hour').format('HH:mm:ss'));

        // const timeHourAgo = await Station.timeToSeconds('21:12:16');

        let averageData = stations.map((station) => {

            const aqi = station['aqi'][month][day];

            let response  = {
                stationId: station.stationId.replace('GV', 'AIRGV'),
                stationName: station.stationName,
                stationLocation: station.stationLocation,
                currentTime: currentTime
            };

            if(!aqi){
                response['averageMeasurementsData'] = {
                    pm10: null,
                    "pm2.5": null
                };

                return response;
            }

            if(aqi[0].seconds + 1800 < currentSeconds) {
                response['averageMeasurementsData'] = {
                    pm10: null,
                    "pm2.5": null
                };
                return response;
            }

            const lastHourData = aqi.filter(a => a.seconds >= timeHourAgo && a.seconds <= timeNow);
            let pm10 = 0;
            let pm25 = 0;

            lastHourData.forEach((m) => {
                pm10 = pm10 + parseFloat(m.pm10);
                pm25 = pm25 + parseFloat(m.pm25);
            });

            response['averageMeasurementsData'] = {
                pm10: (pm10 / lastHourData.length).toFixed(0),
                "pm2.5": (pm25 / lastHourData.length).toFixed(0)
            };

            return response;
        });

        return res.send(averageData);

    } catch (e) {
        return res.status(400).send(e);
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

        const stationId = req.body.data.info.stationId;
        const stationName = req.body.data.info.stationName;
        const year  = req.body.data.info.year;
        const month  = req.body.data.info.month;
        const day  = req.body.data.info.day;
        const stationLocation  = req.body.data.stationLocation;
        const station = await Station.findOne({ stationId: stationId, year: year });

        if(!station) {
            const newStation = new Station({
                stationId: stationId,
                stationName: stationName,
                stationLocation: stationLocation,
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