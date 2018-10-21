'use strict'

const cfg = {
  server: {
    port: 3001,
    version: '1.0.0',
    env: process.env.ENV || 'DEV',
    secret: 'nataliebeckyhagar'
  },
  mongo: {
    url: 'localhost',
    user: 'refact',
    password: 'refact',
    db: () => cfg.server.env !== 'TEST' ? 'refact' : 'refact'
  }
}

if (cfg.server.ENV === 'DIST') process.env.NODE_ENV = 'production'

module.exports = cfg
