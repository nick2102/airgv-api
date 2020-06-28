const express = require('express');
const bodyParser = require('body-parser');
require('./db/mongoose');
const FetchJsonService = require('./services/FetchJson');
const fetchJson =  new FetchJsonService();

//Routers
const aqiData = require('./routers/AqiData');

const app = express();

const port = process.env.PORT || 3000;


app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use routers
app.use(aqiData);

app.listen(port, ()=> {
    console.log('Server is up and running on port ' + port);
});