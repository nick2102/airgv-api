const mongoose = require('mongoose');
const validator = require('validator');

const StationSchema = new mongoose.Schema ({
    year: {
        type: String,
        required: true,
    },
    stationId: {
        type: String,
        required: true,
    },
    stationName: {
        type: String,
        required: true,
    },
    stationLocation: {
        type: Object,
        required: true
    },
    aqi: {
        type: Object,
        required: true
    }
}, {timestamps: true} );

StationSchema.statics.generateAqiData = async (req) => {
    const currentDate = req.data.info.date;
    const day = currentDate.split('.')[0];
    const month = currentDate.split('.')[1];
    const year = currentDate.split('.')[2];

    const a = req.data.info.time.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);

    const aqiData = {};
    aqiData[month] = {};
    aqiData[month][day] = [];
    aqiData[month][day].unshift({ pm10 : req.data.aqi.pm10, pm25 : req.data.aqi.pm25, time : req.data.info.time, seconds: seconds })
    return aqiData;
}

StationSchema.statics.timeToSeconds = async (time) => {
    const a = time.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    return seconds;
}

StationSchema.statics.timeFormat = async (today) => {
    const hours =  today.getHours() > 9 ? today.getHours() : '0' + ( today.getHours() );
    const minutes =  today.getMinutes() > 9 ? today.getMinutes() : '0' + ( today.getMinutes() );
    const seconds =  today.getSeconds() > 9 ? today.getSeconds() : '0' + ( today.getSeconds() );
    return hours + ':' + minutes + ':' + seconds;
}

StationSchema.statics.mapStationNameId = async (isName = true, id) => {
    const ids = {
        'golem_pazar' : 'GV-GOLEMPAZAR-01',
        'makpetrol' : 'GV-MAKPETROL-01'
    }

    const names = {
        'golem_pazar' : 'AirGostivar.mk GV - Golem Pazar',
        'makpetrol' : 'AirGostivar.mk GV - Sretko Krsteski - Makpetrol'
    }

    return isName ? names[id] : ids[id];
}

const Station = mongoose.model('Station', StationSchema);
module.exports = Station;