require('dotenv').config()

const express = require('express')

const app = express()

const routes = require('./routes')

const PORT = process.env.PORT || 3000

const morgan = require('morgan')
let index = require('./algolia/emergencyHousingServices')
let bodyParser = require('body-parser');
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
	console.log('req.params',req.params)
	console.log('req.query',req.query)
	console.log('req.body',req.body)
	index.search(req.body.query, (err, content) => {
		res.render('results', { content })
	});
});

app.use('/', routes)

app.listen(PORT, function () {
	console.log(`Crash Here app listening on port ${PORT}!`)
});
