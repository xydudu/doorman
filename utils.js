'use strict'

const pm2 = require('pm2')

function start(_app) {
    return new Promise((_resolve, _reject) => {
        pm2.connect(_err => {
            if (_err) return _reject(_err)
            pm2.start(_app, (_err, _apps) => {
                pm2.disconnect()
                if (_err) return _reject(_err)
                let app = _apps[0]
                if (app.pm2_env) {
                    app = app.pm2_env
                }
                if (app.status === 'online')
                    _resolve(app)
                else _reject('start error')
            })
        })
    })
}

function list(_apps) {
    return new Promise((_resolve, _reject) => {
        pm2.connect(_err => {
            if (_err) return _reject(_err)
            pm2.list((_err, _list) => {
                pm2.disconnect()
                if (_err) return _reject(_err)
                let apps = _apps.map(_app => {
                    let app = _list.find(_item => {
                        return _item.name === _app.name
                    })
                    
                    _app.status = app
                        ? (app.status || app.pm2_env.status)
                        : 'ready'

                    return _app
                })
                _resolve(apps) 
            })
        }) 
    })
}

function stop(_app) {
    let key = _app.pm_id || _app.name
    return new Promise((_resolve, _reject) => {
        pm2.connect(_err => {
            if (_err) return _reject(_err)
            pm2.stop(key, (_err, _proc) => {
                pm2.disconnect()
                if (_err) return _reject(_err)
                let app = _proc[0]
                if (app.status === 'stopped')
                    _resolve(app) 
                else
                    _reject('stop err') 
            })
        }) 
    })
}

module.exports = {
    start, list, stop    
}
