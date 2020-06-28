const mongoose = require('mongoose');

const testSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true,
    },
    pm10: {
        type: String,
    }
}, {timestamps: true} );

const Test = mongoose.model('Test', testSchema);
module.exports = Test;