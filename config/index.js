require('dotenv').config()

const config = {
  server: {
    port: process.env.PORT,
    dev: process.env.NODE_ENV !== 'production'
  },
  api: {
    url: process.env.API_URL,
    token: process.env.API_KEY_TOKEN
  },
  oauth: {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    facebook: {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    }
  }
}

module.exports = config