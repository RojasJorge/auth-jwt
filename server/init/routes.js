'use strict'

const handlers = require('../handlers')
const joi = require('joi')

const routes = (server) => [{
        method: 'GET',
        path: '/',
        config: {
            auth: false,
            handler: (request, reply) => {
                reply({ version: config.get('/version') })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/v1/login',
        config: {
            auth: false,
            handler: handlers.user.login,
            validate: {
                payload: {
                    user: joi.object().keys({
                        email: joi.string().email().required(),
                        passwd: joi.string().required()
                    }).required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/users',
        config: {
            auth: {
                scope: [
                    'admin',
                    'authenticated'
                ]
            },
            handler: handlers.user.all
        }
    },
    {
        method: 'POST',
        path: '/api/v1/user/add',
        config: {
            auth: {
                scope: [
                    'authenticated',
                    'admin'
                ]
            },
            handler: handlers.user.add,
            validate: {
                payload: {
                    user: joi.object().keys({
                        name: joi.string().required(),
                        email: joi.string().email().required(),
                        passwd: joi.string().required()
                    }).required()
                }
            }
        }
    }
]

module.exports = routes