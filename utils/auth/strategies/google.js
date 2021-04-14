const passport = require('passport')
const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth')
const axios = require('axios')
const config = require('../../../config')

const { clientID, clientSecret } = config.oauth.google
const { url, token } = config.api

passport.use(new GoogleStrategy({
  clientID,
  clientSecret,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, cb) => {
  const { data, status } = await axios({
    method: 'post',
    url: `${url}/api/auth/sign-provider`,
    data: {
      name: profile._json.name,
      email: profile._json.email,
      password: profile.id,
      apiKeyToken: token
    }
  })
  if (!data || status !== 200) {
    return cb(boom.unauthorized(), false);
  }
  return cb(null, data);
}))