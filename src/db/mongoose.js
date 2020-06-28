const mongoose = require('mongoose');
const connectionString = 'mongodb://ntp_super:M0therlode.321@localhost:27017/admin';

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})