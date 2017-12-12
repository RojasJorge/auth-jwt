'use strict'
/**
 * Get extras
 */

const config = require('../../config')
const misc = require('../handlers/misc-handler')
const _ = require('lodash')

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
            return reply({
                status: 'error',
                err
            })
            return reply(Boom.badImplementation(err))
        }

        result.toArray(function(err, results) {

            if (err) {
                Logger.error(err)
                return reply(Boom.badImplementation(err))

            }

            if (results.length <= 0) {
                return reply({
                    status: 'missing',
                    code: 204,
                    msg: 'Credenciales inválidas'
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
                                email: item.email,
                                scopes: item.scopes
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

const add = (request, reply) => {

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
                passwd: hash,
                status: 1,
                phones: request.payload.user.phones,
                scopes: request.payload.user.scopes
            }).run(request.server.rethink.conn, (err, result) => {
                if (err) {
                    console.log(err)
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

const update = (request, reply) => {

    let objectUpdated = {}

    if (request.payload.user.name !== '-') {
        objectUpdated.name = request.payload.user.name
    }

    if (request.payload.user.phones !== '-') {
        objectUpdated.phones = request.payload.user.phones
    }

    if (request.payload.user.passwd !== '-') {
        const hashUp = bcrypt.hashSync(request.payload.user.passwd, 10)
        objectUpdated.passwd = hashUp
    }

    objectUpdated.scopes = request.payload.user.scopes

    request.server.rethink.r.db('rapidito').table('users').get(request.payload.user.id).update(objectUpdated).run(request.server.rethink.conn, (err, result) => {
        if (err) {
            throw err
        }
        return reply({
            status: 'success',
            code: 200,
            msg: 'Se han actualizado los datos correctamente',
            data: result
        })
    })
}

const get = (request, reply) => {
    request.server.rethink.r.db('rapidito').table('users').get(request.query.id).run(request.server.rethink.conn, (err, user) => {
        if (err) {
            throw err
        }
        return reply({
            status: 'success',
            code: 200,
            msg: 'Usuario encontrado',
            data: user
        })
    })
}

const all = (request, reply) => {

    //Compare the user with the rates.
    // request.server.rethink.r.db('rapidito').table('users').eqJoin('rate_id', request.server.rethink.r.db('rapidito').table('rates')).run(request.server.rethink.conn, (err, result) => {
    //     if (err) {
    //         throw err
    //     }
    //     reply({
    //         status: 'success',
    //         code: 200,
    //         msg: `${result.length} encontrado`,
    //         data: result.toArray()
    //     })
    // })

    request.server.rethink.r.db('rapidito').table('users').filter(request.query || {}).run(request.server.rethink.conn, (err, users) => {
        if (err) {
            throw err
        }
        let usersList = []
        users.toArray((err, user) => {
            if (err) {
                throw err
            }
            _.forEach(user, function(value) {
                const omitPassword = _.omit(value, 'passwd')
                usersList.push(omitPassword)
            })
            reply({
                status: 'success',
                code: 200,
                msg: 'Listado completo de usuarios',
                data: usersList
            })
        })
    })
}

module.exports = {
    all,
    login,
    add,
    get,
    update,
    validate
}