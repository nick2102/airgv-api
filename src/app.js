const path = require('path')
const express =  require('express')
const hbs = require('hbs')
const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')

const app = express()
const port = 3000

// Define paths for express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setuo static directory to serve
app.use(express.static(publicDirectoryPath))

//Routes
app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather App',
        name: 'Nikola Nikoloski'
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Me',
        name: 'Nikola Nikoloski'
    })
})

app.get('/help', (req, res) => {
    res.render('help', {
        title: 'Help page',
        message: 'Help message',
        name: 'Nikola Nikoloski'
    })
})

app.get('/weather', (req, res) => {
    const searchTerm = req.query.search

    if(!searchTerm)
        return res.send({ error: 'You must provide address.'})

    geocode(searchTerm, (error, {latitude, longitude, location_name} = {}) => {
        if(error)
            return res.send({ error })

        forecast(longitude, latitude, (error, forecastData) => {
            if(error)
                return console.log(error)

            res.send({
                forecast: forecastData,
                location: location_name,
                address: searchTerm
            })
        })

    })
})

app.get('/help/*', (req, res)=> {
    res.render('404', {
        title: 'Article not found.',
        name: 'Nikola Nikoloski'
    })
})

app.get('*', (req, res)=> {
    res.render('404', {
        title: 'Page not Found.',
        name: 'Nikola Nikoloski'
    })
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

