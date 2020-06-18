const mongoose = require('mongoose');
const connectionString = 'mongodb://127.0.0.1:27017/airgv-aqi';

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})