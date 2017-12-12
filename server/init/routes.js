'use strict'

const handlers = require('../handlers')
const Joi = require('joi')

const routes = (server) => [{
        /**
         * DEFAULT SYSTEM
         */
        method: 'GET',
        path: '/',
        config: {
            auth: false,
            handler: (request, reply) => {
                reply({ version: config.get('/version') })
            }
        }
    },
    /**
     * SYSTEM AUTH
     * ####################################################################
     */
    {
        method: 'POST',
        path: '/api/v1/login',
        config: {
            auth: false,
            handler: handlers.user.login,
            validate: {
                payload: {
                    user: Joi.object().keys({
                        email: Joi.string().email().required(),
                        passwd: Joi.string().required()
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
            handler: handlers.user.all,
            validate: {
                query: {
                    id: Joi.string().min(10).optional()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/v1/user/add',
        config: {
            auth: false,
            auth: {
                scope: [
                    'authenticated',
                    'admin'
                ]
            },
            handler: handlers.user.add,
            validate: {
                payload: {
                    user: Joi.object().keys({
                        name: Joi.string().required(),
                        email: Joi.string().email().required(),
                        passwd: Joi.string().required(),
                        phones: Joi.string().optional(),
                        scopes: Joi.array().required()
                    }).required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/v1/user/update',
        config: {
            auth: {
                scope: [
                    'authenticated',
                    'admin'
                ]
            },
            handler: handlers.user.update,
            validate: {
                payload: {
                    user: Joi.object().keys({
                        name: Joi.string().required(),
                        id: Joi.string().required(),
                        phones: Joi.string().optional(),
                        passwd: Joi.string().optional(),
                        scopes: Joi.array().required()
                    }).required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/user',
        config: {
            auth: {
                scope: [
                    'authenticated',
                    'admin'
                ]
            },
            handler: handlers.user.get,
            validate: {
                query: {
                    id: Joi.string().required()
                }
            }
        }
    },
    /**
     * SYSTEM CONFIGS
     * ####################################################################
     */
    {
        method: 'POST',
        path: '/api/v1/system/test/add',
        config: {
            auth: false,
            // auth: {
            //     scope: [
            //         'authenticated'
            //     ]
            // },
            handler: handlers.system.test_insert,
            validate: {
                payload: {
                    title: Joi.string().max(250).min(2).required(),
                    logs: Joi.array().items(Joi.object().keys({
                        details: Joi.string().max(800).optional(),
                        date: Joi.date().default(Date.now()).forbidden()
                    }))
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/v1/system/test/update',
        config: {
            auth: false,
            // auth: {
            //     scope: [
            //         'authenticated'
            //     ]
            // },
            handler: handlers.system.test_update,
            validate: {
                payload: {
                    id: Joi.string().max(250).min(10).required(),
                    log: Joi.object().keys({
                        details: Joi.string().max(800).optional(),
                        date: Joi.date().default(Date.now()).forbidden()
                    }).optional()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/v1/system/status/add',
        config: {
            auth: {
                scope: [
                    'authenticated',
                    'admin',
                    'super-admin'
                ]
            },
            handler: handlers.system.status_add,
            validate: {
                payload: {
                    title: Joi.string().max(250).min(2).required(),
                    description: Joi.string().max(800).min(1).default('...').optional(),
                    weight: Joi.number().min(0).max(50).required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/system/status',
        config: {
            auth: {
                scope: [
                    'authenticated'
                ]
            },
            handler: handlers.system.status_list,
            validate: {
                query: {
                    id: Joi.string().min(10).optional(),
                    title: Joi.string().max(250).min(2).optional()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/system/departments',
        config: {
            auth: {
                scope: [
                    'authenticated'
                ]
            },
            handler: handlers.system.departments
        }
    },
    {
        method: 'GET',
        path: '/api/v1/system/department/{id}',
        config: {
            auth: {
                scope: [
                    'authenticated'
                ]
            },
            handler: handlers.system.department
        }
    },
    {
        method: 'GET',
        path: '/api/v1/rate',
        config: {
            auth: {
                scope: [
                    'authenticated'
                ]
            },
            handler: handlers.system.rates,
            validate: {
                query: {
                    id: Joi.string().optional()
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/v1/rates/add',
        config: {
            auth: {
                scope: [
                    'admin',
                    'authenticated'
                ]
            },
            handler: handlers.system.rates_add,
            validate: {
                payload: {
                    title: Joi.string().min(5).max(50).required(),
                    rate: Joi.number().max(200).min(1).required(),
                    currency: Joi.string().max(1).min(1).required(),
                    currency_code: Joi.string().max(5).min(1).required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/group',
        config: {
            auth: {
                scope: [
                    'admin'
                ]
            },
            handler: handlers.system.groups,
            // validate: {
            //     payload: {
            //         group: Joi.object().keys({
            //             warehouse: Joi.string().max(1).min(1).required(),
            //             lockers: Joi.number().required()
            //         })
            //     }
            // }
        }
    },
    {
        method: 'POST',
        path: '/api/v1/group/add',
        config: {
            auth: {
                scope: [
                    'admin'
                ]
            },
            handler: handlers.system.group_add,
            validate: {
                payload: {
                    group: Joi.object().keys({
                        warehouse: Joi.string().max(1).min(1).required(),
                        lockers: Joi.number().required()
                    })
                }
            }
        }
    },
    /**
     * CLIENTS MODULE ROUTES
     * ####################################################################
     */
    {
        method: 'GET',
        path: '/api/v1/client', // List all
        config: {
            auth: {
                scope: [
                    'admin'
                ]
            },
            handler: handlers.client.list,
            validate: {
                query: {
                    searchKey: Joi.string().optional(),
                    searchValue: Joi.string().optional()
                        // searchValue: Joi.any().optional()
                        // email: Joi.string().email().optional(),
                        // limit: Joi.number().integer().min(0).max(100).optional(),
                        // name: Joi.string().optional(),
                        // lastname: Joi.string().optional(),
                        // nit: Joi.string().optional(),
                        // id: Joi.number().optional()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/client/autofield', // List all
        config: {
            auth: {
                scope: [
                    'admin'
                ]
            },
            handler: handlers.client.autoFields,
            validate: {
                query: {
                    searchKey: Joi.string().required(),
                    searchValue: Joi.string().required()
                        // email: Joi.string().email().optional(),
                        // limit: Joi.number().integer().min(0).max(100).optional(),
                        // name: Joi.string().optional(),
                        // lastname: Joi.string().optional(),
                        // nit: Joi.string().optional(),
                        // id: Joi.number().optional()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/client/{id}', // List 1
        config: {
            auth: {
                scope: [
                    'admin'
                ]
            },
            handler: handlers.client.show
        }
    },
    {
        method: 'POST',
        path: '/api/v1/client',
        config: {
            auth: {
                scope: [
                    'admin',
                    'authenticated'
                ]
            },
            handler: handlers.client.add,
            validate: {
                payload: {
                    client: Joi.object().keys({
                        avatar: Joi.string().optional(),
                        lastname: Joi.string().min(3).max(250).required(),
                        name: Joi.string().min(3).max(250).required(),
                        document_id: Joi.string().min(6).max(30).required(),
                        title: Joi.string().min(2).max(15).optional(),
                        department: Joi.string().min(2).max(36).required(),
                        municipality: Joi.string().min(2).max(30).required(),
                        zone: Joi.number().min(1).max(25).required(),
                        address: Joi.string().min(10).max(250).required(),
                        telephone: Joi.string().min(8).max(15).required(),
                        cellphone: Joi.string().min(8).max(15).required(),
                        email: Joi.string().email().required(),
                        description: Joi.string().min(2).max(800).optional(),
                        status: Joi.number().min(1).max(2),
                        rate_id: Joi.string().min(6).max(36).required(),
                        departmental: Joi.number().min(0).max(1).required(),
                        nit: Joi.string().min(8).max(8).required(),
                        business_name: Joi.string().max(250).required(),
                        business_address: Joi.string().max(250).required(),
                    }).required()
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/v1/client',
        config: {
            auth: {
                scope: [
                    'admin',
                    'authenticated'
                ]
            },
            handler: handlers.client.update,
            validate: {
                payload: {
                    client: Joi.object().keys({
                        id: Joi.number().min(1).required(),
                        avatar: Joi.string().optional(),
                        lastname: Joi.string().min(3).max(250).required(),
                        name: Joi.string().min(3).max(250).required(),
                        document_id: Joi.string().min(6).max(30).required(),
                        title: Joi.string().min(2).max(15).optional(),
                        department: Joi.string().min(2).max(36).required(),
                        municipality: Joi.string().min(2).max(30).required(),
                        zone: Joi.number().min(1).max(25).required(),
                        address: Joi.string().min(10).max(250).required(),
                        telephone: Joi.string().min(8).max(15).required(),
                        cellphone: Joi.string().min(8).max(15).required(),
                        email: Joi.string().email().required(),
                        description: Joi.string().min(2).max(800).optional(),
                        status: Joi.number().min(1).max(2),
                        rate_id: Joi.string().min(6).max(36).required(),
                        nit: Joi.string().min(8).max(8).required(),
                        business_name: Joi.string().max(250).required(),
                        business_address: Joi.string().max(250).required(),
                    }).required()
                }
            }
        }
    },
    /**
     * Package endpoints
     */
    {
        method: 'POST',
        path: '/api/v1/package/add',
        config: {
            auth: {
                scope: [
                    'admin',
                    'authenticated'
                ]
            },
            handler: handlers.package.add,
            validate: {
                payload: {
                    package: Joi.object().keys({
                        tracking: Joi.string().min(5).max(150).required(),
                        client: Joi.number().required(),
                        weight: Joi.object().keys({
                            value: Joi.number().required(),
                            unit: Joi.string().default('lbs')
                        }),
                        status: Joi.string().required(),
                        system_status: Joi.number().max(2).min(1).default(1),
                        created_at: Joi.date().default(Date.now()),
                        logs: Joi.array().items(Joi.object().keys({
                            userId: Joi.string().min(20).max(50).optional(),
                            userName: Joi.string().min(4).max(200).optional(),
                            date: Joi.date().default(Date.now()).forbidden(),
                            details: Joi.string().max(800).optional()
                        })).optional()
                    }).required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/package',
        config: {
            auth: {
                scope: [
                    'admin',
                    'authenticated'
                ]
            },
            handler: handlers.package.list,
            validate: {
                query: {
                    id: Joi.string().optional(),
                    client: Joi.number().min(1).optional(),
                    status: Joi.string().min(10).max(50).optional(),
                    tracking: Joi.string().min(5).max(100).optional()
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/v1/package/log',
        config: {
            auth: {
                scope: [
                    'admin',
                    'authenticated'
                ]
            },
            handler: handlers.package.log_register,
            validate: {
                query: {
                    id: Joi.string().optional(),
                    logs: Joi.array().items(Joi.object().keys({
                        userId: Joi.string().min(20).max(50).required(),
                        userName: Joi.string().min(4).max(200).required(),
                        date: Joi.date().default(Date.now()).forbidden(),
                        details: Joi.string().max(800).required()
                    })).required()
                }
            }
        }
    }
]

module.exports = routes