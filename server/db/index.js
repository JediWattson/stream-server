const { Sequelize } = require('sequelize')
const user = require('./user')

const init = async () => {
  const seq = new Sequelize(process.env.POSTGRES_URL)
  await seq.authenticate()
  const User = user(seq)
  seq.sync();
  return { User }
}

module.exports = init
