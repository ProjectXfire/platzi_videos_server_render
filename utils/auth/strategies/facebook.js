const passport = require('passport');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const axios = require('axios')
const boom = require('@hapi/boom')
const config = require('../../../config')

const { clientID, clientSecret } = config.oauth.facebook
const { token, url } = config.api

passport.use(new FacebookStrategy({
  clientID,
  clientSecret,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, { _json: profile }, cb) => {
  const { data, status } = await axios({
    url: `${url}/api/auth/sign-provider`,
    method: "post",
    data: {
        name: profile.name,
        email: profile.email,
        password: profile.id,
        apiKeyToken: token
    }
  })
  if (!data || status !== 200) {
    return cb(boom.unauthorized(), false);
  }
  return cb(null, data);
}))
