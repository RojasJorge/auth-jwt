'use strict'

const config = require('../../config')

const Boom = require('boom')

const Logger = require('bucker').createLogger({
    name: 'server',
    console: config.get('/logger/options/console')
})

let resp

const user_exists = (request, reply, email, callback) => {

    request.server.rethink.r.db('rapidito').table('users').filter({ email: email }).run(request.server.rethink.conn, (err, result) => {
        if (err) {
            Logger.error(err)
            return reply(Boom.badImplementation(err))
        }

        result.toArray(function(err, results) {
            if (err) {
                Logger.error(err)
                return reply(Boom.badImplementation(err))
            }

            if (results.length <= 0) {
                callback(null)
            }

            results.map((item) => {
                if (item.email === request.payload.user.email) {
                    callback(true);
                } else {
                    callback(null)
                }
            })
        })
    })
    return resp
}

module.exports = {
    user_exists
}