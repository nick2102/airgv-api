const mongoose = require('mongoose');
const validator = require('validator');

const AqiSchema = new mongoose.Schema ({
    year: {
        type: Object,
        required: true,
    },
    station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station'
    },
}, {timestamps: true} );

AqiSchema.statics.generateAqiData = async (station, req) => {
    const currentDate = req.data.info.date;
    const day = currentDate.split('.')[0];
    const month = currentDate.split('.')[1];
    const year = currentDate.split('.')[2];

    const a = req.data.info.time.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);

    const aqiData = { station_id : station._id, year: {}  };
    aqiData['year'][year] = {};
    aqiData['year'][year][month] = {};
    aqiData['year'][year][month][day] = {};
    aqiData['year'][year][month][day][seconds] = { pm10 : req.data.aqi.pm10, pm25 : req.data.aqi.pm25, time : req.data.info.time, seconds: seconds };

    return aqiData;
}

AqiSchema.statics.timeToSeconds = async (time) => {
    const a = time.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    return seconds;
}

const Aqi = mongoose.model('Aqi', AqiSchema);
module.exports = Aqi;