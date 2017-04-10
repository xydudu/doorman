'use strict'

const utils = require('../utils')
const config = require('config')
const applications = config.get('applications')
const assert = require('assert')

describe('doorman utils', () => {
     
    let pm_id = -1
    it('start', done => {
        let app = applications[0]  
        utils.start(app) 
            .then(_app => {
                pm_id = _app.pm_id
                assert.equal(_app.name, app.name)
                assert.notEqual(pm_id, -1)
            })
            .then(done)
            .catch(done)
    })

    it('start a app online', done => {
        let app = applications[0]  
        utils.start(app) 
            .then(_app => {
                assert.equal(_app.name, app.name)
                assert.equal(_app.pm_id, pm_id)
            })
            .then(done)
            .catch(done)
    })

    it('list', done => {
        utils.list(applications)
            .then(_list => {
                assert.equal(_list[0].name, applications[0].name)
                assert.equal(_list[0].status, 'online')
            })
            .then(done)
            .catch(done)
    })
    it('stop', done => {
        let app = applications[0]
        utils.stop(app)
            .then(_ => utils.list(applications))
            .then(_list => {
                assert.equal(_list[0].name, applications[0].name)
                assert.equal(_list[0].status, 'stopped')
            })
            .then(done)
            .catch(done)
    })

})
