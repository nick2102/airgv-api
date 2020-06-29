const mongoose = require('mongoose');
const connectionString = 'ntp_super:M0therlode.321mongodb://localhost:27017/admin';

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})