const express = require('express')
const algoliasearch = require('algoliasearch');
const rp = require('request-promise');
var geocoder = require('geocoder');

const app = express()
const routes = require('./routes')
const PORT = process.env.PORT || 3000

let client = algoliasearch('7SG71R3MGX', '6536717a06b5e0e332e909e22eac2aa9');
let index = client.initIndex('Emergency Housing Services');
let bodyParser = require('body-parser');

var googleMapsClient = require('@google/maps').createClient({
  key: ''
});

app.set('view engine', 'pug')
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
	console.log('req.body',req.body)

	rp({
		uri: `https://ipinfo.io/${req.ip == '::1' ? '': req.ip}`,
		json: true
	})
	.then(data => {
		console.log('data',data)

		let ipLat = parseFloat(data.loc.split(',')[0]);
		let ipLng = parseFloat(data.loc.split(',')[1]);

		if (!req.body.query) {
			res.render('results', { content: { hits:[], highlights: [] }, formatted_address: "" });
		}

		googleMapsClient.placesAutoComplete({
			input: req.body.query,
			language: 'en',
			location: [ipLat, ipLng],
			radius: 10000,
			components: {country: 'nz'}

		}, (err, response) => {

			if (!response.json.predictions.length) {
				index.search({ 
					query: req.body.query,
					aroundLatLng: `${ipLat}, ${ipLng}` 
				}, (err, content) => {
					res.render('results', { content, formatted_address: "" })
				});
			}

			console.log('response.json.predictions', response.json.predictions)
			console.log('err', err);
			console.log('response', response);
			console.log('response.json.predictions[0].place_id',response.json.predictions[0].place_id)

			googleMapsClient.reverseGeocode({
			  place_id: response.json.predictions[0].place_id
			}, (err, response) => {

				console.log('err',err);
				console.log('response',response);
				console.log('response.json.results',response.json.results)
				console.log(response.json.results[0].geometry.location)

				let location = response.json.results[0].geometry.location;
				// let formatted_address = response.json.results[0].formatted_address;
				let formatted_address = response.json.results[0].formatted_address+`${location.lat}, ${location.lng}`;

				index.search({
					query: req.body.query, 
					aroundLatLng: `${location.lat}, ${location.lng}`}, (err, content) => {

					res.render('results', { content, formatted_address })
				});

			})

		});
	})

});

app.use('/', routes)

app.listen(PORT, function () {
	console.log(`Crash Here app listening on port ${PORT}!`)
});
