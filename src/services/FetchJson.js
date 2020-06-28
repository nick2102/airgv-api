const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const Aqi = require('../models/Aqi');
const Station = require('../models/Station');
require('log-timestamp');

const directoryPath = path.join(__dirname, '../aqi-jsons');

class FetchJsonService {
    constructor() {

        // this.readJsonDir();
        this.watchStations();

        // this.jsonFiles = {};
    }

    watchStations() {

        fs.readdir(directoryPath, (err, files) => {

            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }

            files.forEach(function (file) {
                let md5Previous = null;

                fs.watch(directoryPath + '/' + file, async (event, filename) => {
                    if (filename) {
                        const fileContentBuffer = fs.readFileSync(directoryPath + '/' + filename);
                        const fileContentArray = JSON.parse(fileContentBuffer.toString());
                        const firstElementDate = fileContentArray[0].time.split(' ');
                        const currentDate = firstElementDate[0];
                        const stationName = filename.split('.')[0];

                        const md5Current = md5(fileContentBuffer);
                        if (md5Current === md5Previous) {
                            return;
                        }
                        md5Previous = md5Current;

                        const station = await Station.findOne({ name: stationName });

                        if(!station) {

                            const stationData = {
                                name: stationName,
                            }
                            const station = new Station(stationData);

                            try {
                                const stationID =   await station.save();
                                const data = {
                                    station_id: stationID._id,
                                    day: currentDate.split('.')[0],
                                    month: currentDate.split('.')[1],
                                    year: currentDate.split('.')[2],
                                    date: currentDate,
                                    measurements: fileContentArray
                                }
                                const aqi = new Aqi(data);
                                await aqi.save();
                            } catch (e) {
                                console.log('Error: ', e);
                            }

                            return;
                        }

                        // const savedAqi

                    }
                });
            });
        });

    }

    readJsonDir() {
        let jsons = {};
        fs.readdir(directoryPath, async (err, files) => {

            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            const jsons = await files

            jsons.forEach(function (file) {
                jsons[file.replace('.json', '')] = path.join(__dirname, '../aqi-jsons/' + file);
            });
        });

        console.log(jsons);
        return jsons;
    }
}

module.exports = FetchJsonService;