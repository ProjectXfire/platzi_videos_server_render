const passport = require('passport')
const { OAuth2Strategy } = require('passport-oauth')
const axios = require('axios')
const boom = require('@hapi/boom')
const config = require('../../../config')

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

const { clientID, clientSecret } = config.oauth.google
const { url, token } = config.api

const oAuth2Strategy = new OAuth2Strategy({
  authorizationURL: GOOGLE_AUTHORIZATION_URL,
  tokenURL: GOOGLE_TOKEN_URL,
  clientID,
  clientSecret,
  callbackURL: '/auth/google-oauth/callback'
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    const { data, status } = await axios({
      method: 'post',
      url: `${url}/api/auth/sign-provider`,
      data: {
        name: profile.name,
        email: profile.email,
        password: profile.id,
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
})

oAuth2Strategy.userProfile = async (accessToken, done) => {
  try {
    const { data, status } = await axios({
      url: `${GOOGLE_USERINFO_URL}`,
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!data || status !== 200) {
      return done(boom.unauthorized('Failed to get user information'));
    }
    const { sub, name, email } = data;
    const profile = {
      id: sub,
      name,
      email
    }
    done(null, profile)
  } catch (err) {
    done(err)
  }
}

passport.use('google-oauth', oAuth2Strategy)