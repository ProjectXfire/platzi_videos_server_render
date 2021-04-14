// Express
const express = require('express')

// Helmet
const helmet = require('helmet')

// Passport auth
const passport = require('passport')

// Boom - errors
const boom = require('@hapi/boom')

// Cookies
const cookieParser = require('cookie-parser')

// Axios
const axios = require('axios')

// Config
const config = require('./config')
const { port, dev } = config.server
const { url } = config.api

const app = express()

// Token time in miliseconds
const THIRTY_DAYS_IN_SEC = 2592000000;
const TWO_HOURS_IN_SEC = 7200000;

// Body parser
app.use(express.json())
app.use(cookieParser())

app.use(helmet())

// Basic Strategy
require('./utils/auth/strategies/basic')
// OAuth Strategy
require('./utils/auth/strategies/oauth')
// Google Strategy
require('./utils/auth/strategies/google')
// Facebbok Strategy
require('./utils/auth/strategies/facebook')

// Routes
// Basic authentication
app.post('/auth/sign-in', async (req, res ,next) => {
  passport.authenticate('basic', (err, data) => {
    const { rememberMe } = req.body;
    try {
      if (err) {
        next(boom.unauthorized())
      }
      req.login(data, { session: false }, async (err) => {
        if (err) {
          next(err)
        }
        const { token } = data
        res.cookie('token', token, {
          httpOnly: !dev,
          secure: !dev,
          maxAge: rememberMe ? THIRTY_DAYS_IN_SEC : TWO_HOURS_IN_SEC
        })
        res.status(200).json(data.user)
      })
    } catch (err) {
      next(err)
    }
  })(req, res, next)
})

app.post('/auth/sign-up', async (req, res ,next) => {
  const user = req.body
  try {
    await axios({
      url: `${url}/api/auth/sign-up`,
      method: 'post',
      data: user
    })

    res.status(201).json({
      message: 'user created'
    })
  } catch (err) {
    next(err)
  }
})

/*
// OAuth Authentication
app.get('/auth/google-oauth', passport.authenticate('google-oauth', {
  scope: ['email', 'profile', 'openid']
}))

app.get(
  '/auth/google-oauth/callback',
  passport.authenticate('google-oauth', { session: false }),
  (req, res, next) => {
    const { rememberMe } = req.body;
    if (!req.user) {
      next(boom.unauthorized())
    } else {
      const { token, user } = req.user
      res.cookie('token', token, {
        httpOnly: !dev,
        secure: !dev,
        maxAge: rememberMe ? THIRTY_DAYS_IN_SEC : TWO_HOURS_IN_SEC
      })
      res.status(200).json(user)
    }
  }
)*/

// Google Authentication
app.get('/auth/google', passport.authenticate('google', {
    scope: ['email', 'profile', 'openid']
  })
);

app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res, next) => {
  if (!req.user) {
    next(boom.unauthorized())
  }
  const { token, user } = req.user
  res.cookie('token', token, {
    httpOnly: !dev,
    secure: !dev
  });
  res.status(200).json(user);
})

// Facebook Authentication
app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res, next) => {
    if (!req.user) {
      next(boom.unauthorized());
    }
    const { token, user } = req.user;
    res.cookie('token', token, {
      httpOnly: !dev,
      secure: !dev
    })
    res.status(200).json(user);
  }
);

// Permission
app.post('/movies', async (req, res ,next) => {

})

app.post('/user/movies', async (req, res ,next) => {
  try {
    const userMovies = req.body
    const { token } = req.cookies
    const { data, status } = await axios({
      url: `${url}/api/user/movies`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: 'post',
      data: userMovies
    })
    if (status !== 201) {
      return next(boom.badImplementation())
    }
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
})

app.delete('/user/movies/:id', async (req, res ,next) => {
  try {
    const id = req.params.id
    const { token } = req.cookies
    const { data, status } = await axios({
      url: `${url}/api/user/movies/${id}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: 'delete'
    })
    if (status !== 200) {
      return next(boom.badImplementation())
    }
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
})

app.listen(port, () => {
  console.log(`Listenning at http://localhost:${port}`)
})