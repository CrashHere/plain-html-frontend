require('dotenv').config()

const express = require('express')
const rp = require('request-promise');

const app = express()
const routes = require('./routes')
const PORT = process.env.PORT || 3000

const morgan = require('morgan')
let index = require('./algolia/emergencyHousingServices')
const performLocationSearch = require('./algolia/performLocationSearch')
let bodyParser = require('body-parser');

var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_KEY
});

app.set('view engine', 'pug')
app.use(morgan('tiny'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/search', (req, res) => {
	res.render('search');
});

app.post('/results', (req, res) => {
	const { body: { query } } = req
	const ip = req.ip.replace(/^.*:/, '');
	rp({
		uri: `https://ipinfo.io/${ip == '1' ? '': ip}`,
		json: true
	})
		.then(data => {
			let ipLat = parseFloat(data.loc.split(',')[0]);
			let ipLng = parseFloat(data.loc.split(',')[1]);
			const location = [ipLat, ipLng]
			return performLocationSearch(query, location)
				.then(data => res.render('results', data))
		})



	// 	if (!req.body.query) {
	// 		res.render('results', { content: { hits:[], highlights: [] }, formatted_address: "" });
	// 	}

	// 	googleMapsClient.placesAutoComplete({
	// 		input: req.body.query,
	// 		language: 'en',
	// 		location: [ipLat, ipLng],
	// 		radius: 10000,
	// 		components: {country: 'nz'}

	// 	}, (err, response) => {

	// 		if (!response.json.predictions.length) {
	// 			index.search({ 
	// 				query: req.body.query,
	// 				aroundLatLng: `${ipLat}, ${ipLng}` 
	// 			}, (err, content) => {
	// 				res.render('results', { content, formatted_address: "" })
	// 			});
	// 		}

	// 		console.log('response.json.predictions', response.json.predictions)
	// 		console.log('err', err);
	// 		console.log('response', response);
	// 		console.log('response.json.predictions[0].place_id',response.json.predictions[0].place_id)

	// 		googleMapsClient.reverseGeocode({
	// 		  place_id: response.json.predictions[0].place_id
	// 		}, (err, response) => {

	// 			console.log('err',err);
	// 			console.log('response',response);
	// 			console.log('response.json.results',response.json.results)
	// 			console.log(response.json.results[0].geometry.location)

	// 			let location = response.json.results[0].geometry.location;
	// 			// let formatted_address = response.json.results[0].formatted_address;
	// 			let formatted_address = response.json.results[0].formatted_address+`${location.lat}, ${location.lng}`;

	// 			index.search({
	// 				query: req.body.query, 
	// 				aroundLatLng: `${location.lat}, ${location.lng}`}, (err, content) => {

	// 				res.render('results', { content, formatted_address })
	// 			});

	// 		})

	// 	});
	// })

});
app.get('/results', (req, res) => {
	res.redirect('/search');
})

app.use('/', routes)

app.listen(PORT, function () {
	console.log(`Crash Here app listening on port ${PORT}!`)
});
