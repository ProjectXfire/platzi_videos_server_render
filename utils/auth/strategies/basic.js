const passport = require('passport')
const { BasicStrategy } = require('passport-http')
const boom = require('@hapi/boom')
const axios = require('axios')
const config = require('../../../config')

const { url, token } = config.api

passport.use(new BasicStrategy(async (email, password, cb) => {
  try {
    const { data, status } = await axios({
      method: 'post',
      url: `${url}/api/auth/sign-in`,
      auth: {
        username: email,
        password
      },
      data: {
        apiKeyToken: token
      }
    })
    if (!data || status !== 200) {
      return cb(boom.unauthorized(), false)
    }
    return cb(null, data)
  } catch (err) {
    cb(err)
  }
}))