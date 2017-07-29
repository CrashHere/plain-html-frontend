const algoliasearch = require('algoliasearch')
const client = algoliasearch('7SG71R3MGX', '6536717a06b5e0e332e909e22eac2aa9')
const index = client.initIndex('Emergency Housing Services')

module.exports = index
