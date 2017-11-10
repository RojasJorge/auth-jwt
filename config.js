'use strict'

const _ = require('lodash'),
    Env = require('dotenv').config(),
    Confidence = require('confidence'),
    ToBoolean = require('to-boolean')

const pack = require('./package')

const config = {
    $meta: 'This file defines all configuration for project.',
    name: pack.name,
    version: pack.version,
    description: pack.description,
    auth_key: '~1GK~Md[mB,F;(o^kw9drj9u~mErMK?Q1Yolg3vL-_V`oaP(VwkLN3HsRa[5sJMA',
    app: {
        host: process.env.APP_HOST || 'localhost',
        port: process.env.APP_PORT || 2001
    },
    logger: {
        options: {
            console: ToBoolean(_.defaultTo(process.env.LOGGER_DEBUG, true))
        }
    }
}

const store = new Confidence.Store(config),
    criteria = {
        env: process.env.APP_ENV
    }

module.exports = {
    get: key => store.get(key, criteria),
    meta: key => store.meta(key, criteria)
}