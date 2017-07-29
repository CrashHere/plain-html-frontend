const express = require('express')
const MessagingResponse = require('twilio').twiml.MessagingResponse

const index = require('../algolia/emergencyHousingServices')

const router = new express.Router()

router.post('/', (req, res) => {
  const query = req.body.Body
  index.search(query, (error, content) => {
    if (error) {
      res.status(500).send('Database error')
    }
    const firstHit = content.hits[0]
    let message = ''
    if (firstHit) {
      const { address, name, phone } = firstHit
      message = `Your closest shelter is ${name}${address ? 'at ' + address : ''}. It can be reached at ${phone}.`
    } else {
      message = `No shelters found.`
    }
    console.log(message)
    const twiml = new MessagingResponse()
    twiml.message(message)
    res.writeHead(200, {'Content-Type': 'text/xml'})
    res.end(twiml.toString())
  })
})

module.exports = router
