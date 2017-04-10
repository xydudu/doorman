'use strict'

const Hapi = require('hapi')
    , utils = require('./utils')
    , Basic = require('hapi-auth-basic')

const config = require('config')
    , port = config.get('port') || 3000
    , admin = config.get('admin')
    , applications = config.get('applications')


const server = new Hapi.Server()
server.connection({port})

const validateFunc = (_req, _username, _password, _callback) => {

    let {username, password} = admin
    let ok = (_password === password && _username === username)
    if (ok)
        _callback(null, true, {name: username})
    else
        _callback(null, false)
}

server.register(Basic, _err => {
    if (_err) {
        throw _err
    }

    server.auth.strategy('simple', 'basic', {validateFunc})
    server.route([
        {
            method: 'GET',
            path: '/',
            config: {
                auth: 'simple',
                handler: (_req, _res) => {
                    
                    utils.list(applications)
                        .then(_list => {
                            let applications_list = _list.map(_app => {
                                let link = ''
                                if (!_app.status || _app.status === 'stopped' || _app.status === 'ready')
                                    link = `<a href="/start/${_app.name}">start</a>`
                                else
                                    link = `<a href="/stop/${_app.name}">stop</a>`
                                return `<li>${_app.name} (${_app.status}) ${link}</li>`
                            })        
                            let html = `
                                    <h1>Doorman <small><a href="/logout">logout</a></small></h1>
                                    <hr />
                                    <ul>${applications_list}</ul> 
                                `
                            _res(html)
                        })
                        .catch(_err => {
                            console.error(_err)
                            _res('errors, please restart server').code(500)
                        })
                }
            }
        },
        {
            method: 'GET',
            path: '/{method}/{name}',
            config: {
                auth: 'simple',
                handler: (_req, _res) => {
                    let app_name = _req.params.name
                        , method = _req.params.method
                        , app = applications.filter(_app => _app.name === app_name) 

                    if (!app.length) return _res.redirect('/') 
                    if (!(method === 'stop' || method === 'start')) return _res.redirect('/') 

                    app = app[0] 
                    utils[method](app)
                        .then(_app => {
                            _res.redirect('/')
                        })
                        .catch(_ => {
                            console.error(_)
                            _res(`${app.name} ${method} error`).code(500)
                        })

                }
            }

        },
        {
            method: 'GET',
            path: '/logout',
            config: {
                handler: (_req, _res) => {
                    _res('bey ...').code(401)
                }
            }
        }
    ])
    server.start(_err => {

        if (_err) {
            throw _err
        }

        console.log('server running at: ' + server.info.uri)
    })
})

