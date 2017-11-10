'use strict'

const config = require('../config')
const handlers = require('./handlers')

const Promise = require('bluebird'),
    Hapi = require('hapi'),
    Logger = require('bucker').createLogger({
        name: 'server',
        console: config.get('/logger/options/console')
    })

/**
 * Get the plugins
 */
const plugins = require('./modules/plugins')

/**
 * Get all routes
 */
const routes = require('./init/routes')

/**
 * Connect to Rethink DB
 */
const r = require('rethinkdb')
const ConnectiontDB = r.connect()

/**
 * Start the server
 * @param {*} host 
 * @param {*} port 
 */
const start = (host, port) => {
    return new Promise((resolve, reject) => {

        // Create the server
        const server = new Hapi.Server()
        server.connection({ host, port, routes: { cors: true } })

        /**
         * Check for the DB Connection
         */
        ConnectiontDB.then((conn) => {

            // Add the new Rethinkdb variables to the server
            server.rethink = { r, conn }

            // Register all the plugins
            server.register(plugins, (err) => {

                // catch the error
                if (err) {
                    Logger.error(err)
                    return reject(err)
                }


                /**
                 * Add JWT Strategy for all routes
                 */
                server.auth.strategy('jwt', 'jwt', true, {
                    key: config.get('/auth_key'),
                    validateFunc: handlers.user.validate,
                    verifyOptions: { ignoreExpiration: true }
                })

                // Initialize routes
                server.route(routes(server))

                // Start accepting requests
                server.start((err) => {
                    if (err) {
                        Logger.error(err)
                        return reject(err)
                    }

                    // Server started successfully - register routes
                    Logger.log(`Server running at: ${server.info.uri}`)
                    resolve()
                })

                server.on('request-error', (req, err) => {
                    Logger.error(err)
                })
            })

        })

    })
}

module.exports = {
    start
}