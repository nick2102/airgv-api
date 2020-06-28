const mongoose = require('mongoose');
const connectionString = 'mongodb://ntp_super:M0therlode.321@127.0.0.1:27017/airgv-aqi';

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})