const { middleware, encryptToken, verify, checkToken } = require('./helpers')
const express = require('express')
const router = express.Router()

module.exports = (opts) => {
  const { app, models } = opts
  router.use(middleware)
  
  router.get("/login", async (req, res) => {
    const [username, password] = req.auth
    const user = await models.User.login(username, password)
    const token = encryptToken({ userId: user.id, expiresAt: Date.now() + (1000 * 60 * 60 * 24 * 7) })
    res.cookie('token', token, { httpOnly: true, secure: true })
    res.sendStatus(204)
  })
  
  router.get("/create", async (req, res) => {
    const [username, password] = req.auth
    const noErrors = await models.User.create(username, password)
    if (!noErrors) 
      return res.sendStatus(400) 
      
    res.sendStatus(201) 
  })

  app.use('/auth', router)

  return { verify, checkToken }
}
