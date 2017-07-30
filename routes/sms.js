const express = require('express')
const MessagingResponse = require('twilio').twiml.MessagingResponse

const performLocationSearch = require('../algolia/performLocationSearch')

const router = new express.Router()

router.post('/', (req, res) => {
  const query = req.body.Body
  return performLocationSearch(query)
    .then(({ content }) => {
      console.log(content)
      const firstHit = content.hits[0]
      let message = ''
      if (firstHit) {
        const { address, name, phone } = firstHit
        message = `Your closest shelter is ${name}${address ? ' at ' + address : ''}. It can be reached at ${phone}.`
      } else {
        message = `No shelters found. People in immediate need of somewhere to stay should call Work and Income on 0800 559 009 or call into their nearest Ministry of Social Development service centre.`
      }
      console.log(message)
      const twiml = new MessagingResponse()
      twiml.message(message)
      res.writeHead(200, {'Content-Type': 'text/xml'})
      res.end(twiml.toString())
    })
})

module.exports = router
