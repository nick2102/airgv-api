const request = require('request')

const geocode = (address, callback) => {
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=pk.eyJ1IjoibmlrYWNzayIsImEiOiJja2JrMXk0M2IwMWo0MnhwOWkzcXJwcHo4In0.MEXAgu7xQZLDK_G3jIfzFg&limit=1'
    request( {url, json: true}, (error , {body}) => {
        if(error)
            callback('Unable to connect to location service!', undefined)
        else if (body.features.length === 0)
            callback('Unable to find location. Please try another search', undefined)
        else {
            callback(undefined, {
                latitude: body.features[0].center[1],
                longitude: body.features[0].center[0],
                location_name: body.features[0].place_name
            })
        }

    })
}

module.exports = geocode
