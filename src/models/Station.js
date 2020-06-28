const mongoose = require('mongoose');
const validator = require('validator');

const StationSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true,
    }
}, {timestamps: true} );

const Station = mongoose.model('Station', StationSchema);
module.exports = Station;