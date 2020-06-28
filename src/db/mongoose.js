const mongoose = require('mongoose');
const connectionString = 'mongodb://localhost:27017/airgv_aqi';

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})