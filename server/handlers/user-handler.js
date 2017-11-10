'use strict'
/**
 * Get extras
 */

const config = require('../../config')
const misc = require('../handlers/misc-handler')

const Boom = require('boom')
var JWT = require('jsonwebtoken')

const Logger = require('bucker').createLogger({
    name: 'server',
    console: config.get('/logger/options/console')
})

const bcrypt = require('bcrypt')
const saltRounds = 10

/**
 * validate follows the standard format for hapi-auth-jwt2
 * we expect the decoded JWT to have a 'sid' key which has a valid session id.
 * If the sid is in the sessions table of the database and end_timestamp has
 * not been set, (i.e. null), we know the session is valid.
 */

const validate = (decoded, request, callback) => {
    request.server.rethink.r.db('rapidito').table('users').get(decoded).run(request.server.rethink.conn, (err, result) => {
        if (err) {
            return callback(null, false)
        }

        return callback(null, true, { scope: result.scopes })
    })
}

/**
 * User login handler
 */

const login = (request, reply) => {

    request.server.rethink.r.db('rapidito').table('users').filter({ email: request.payload.user.email }).run(request.server.rethink.conn, (err, result) => {

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
                return reply({
                    status: 'error',
                    code: 204,
                    msg: 'Usuario no registrado'
                })
            } else {
                results.map((item) => {

                    if (bcrypt.compareSync(request.payload.user.passwd, item.passwd)) {

                        console.log(item.name + ' verified!')

                        var token = JWT.sign(item.id, config.get('/auth_key'))

                        return reply({
                            status: 'success',
                            code: 200,
                            msg: `Bienvenido de nuevo ${item.name}`,
                            user: {
                                id: item.id,
                                name: item.name,
                                email: item.email
                            },
                            token: token
                        })
                    } else {
                        console.log(item.name + ' fail password verification! (auth)')
                        return reply({
                            status: 'error',
                            code: 401,
                            msg: 'Contraseña inválida'
                        })
                    }
                })
            }
        })

    })

}


/**
 * User Add controller
 */

const add = async(request, reply) => {

    misc.user_exists(request, reply, request.payload.user.email, function(err) {

        if (err) {
            return reply({
                status: 'error',
                code: 302,
                msg: `La cuenta ${request.payload.user.email} ya está en uso`
            })
        } else {

            let hash = bcrypt.hashSync(request.payload.user.passwd, 10)

            request.server.rethink.r.db('rapidito').table('users').insert({
                name: request.payload.user.name,
                email: request.payload.user.email,
                passwd: hash
            }).run(request.server.rethink.conn, (err, result) => {
                if (err) {
                    throw err
                }
                console.log(result)
                return reply({
                    status: 'success',
                    code: 200,
                    msg: 'El usuario se ha creado exitosamente'
                })
            })
        }
    })
}

const all = (request, reply) => {
    request.server.rethink.r.db('rapidito').table('users').run(request.server.rethink.conn, (err, result) => {
        if (err) {
            throw err
        }

        reply({
            status: 'success',
            code: 200,
            msg: `${result.length} encontrado`,
            data: result.toArray()
        })
    })
}

module.exports = {
    all,
    login,
    add,
    validate
}