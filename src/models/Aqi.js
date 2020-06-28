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

const Aqi = mongoose.model('Aqi', AqiSchema);
module.exports = Aqi;