const express = require('express')
const app = express()

const routes = require('./routes')

let algoliasearch = require('algoliasearch');
let client = algoliasearch('7SG71R3MGX', '6536717a06b5e0e332e909e22eac2aa9');
let index = client.initIndex('Emergency Housing Services');

app.set('view engine', 'pug')
app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/search', (req, res) => {
	res.render('search');
});

app.post('/search', (req, res) => {
	index.search(req.params.search, (err, content) => {
		res.render('search', { content })
	});
});

app.use('/', routes)

app.listen(3000, function () {
	console.log('Crash Here app listening on port 3000!')
});
