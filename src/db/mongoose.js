const mongoose = require('mongoose');
const connectionString = 'mongodb://ntp_super:M0therlode.321@localhost:27017/admin?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false';

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})