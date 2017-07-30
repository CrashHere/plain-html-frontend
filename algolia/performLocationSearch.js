let index = require('./emergencyHousingServices')

var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_KEY
})

module.exports = function performLocationSearch (query, location) {
  return new Promise((resolve, reject) => {
    googleMapsClient.placesAutoComplete(
      {
        input: query,
        language: 'en',
        radius: 10000,
        components: {
          country: 'nz'
        },
        location
      },
      (error, response) => {
        if (response.json.predictions.length) {
          googleMapsClient.reverseGeocode(
            {
              place_id: response.json.predictions[0].place_id
            },
            (error, response) => {
              if (error) {
                reject(error)
              }
              let location = response.json.results[0].geometry.location
              let formatted_address = response.json.results[0].formatted_address+`${location.lat}, ${location.lng}`
              index.search({
                query: '',
                aroundLatLng: `${location.lat}, ${location.lng}`},
                (error, content) => {
                  resolve(
                    {
                      content,
                      formatted_address
                    }
                  )
              })
            }
          )
        } else {
          index.search(
            {
              query
            },
            (error, content) => {
              resolve({
                content,
                formatted_address: ''
              })
            }
          )
        }
      }
    )
  })
}
