const express = require('express')

const sms = require('./sms')

const router = new express.Router()

router.use('/sms', sms)

module.exports = router
