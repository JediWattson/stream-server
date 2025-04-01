const crypto = require('crypto')
const algo = 'aes-256-gcm'
const key = hexToBytes(
  "7eaa901bbebc5ae90e8e8cd23974d9cf21d1a97cc65d0364a5748bc88fc8b474"
)

function hexToBytes(hexString) {
  const bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.slice(i, i + 2), 16));
  }
  return new Uint8Array(bytes);
}

const middleware = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1]
  const tokenBuffer = Buffer.from(token, "base64")
  req.auth = tokenBuffer.toString("utf8").split(":")
  next() 
}

const encryptToken = (payload) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algo, key, iv)
  const enc = cipher.update(JSON.stringify(payload), 'utf8', 'hex') 
    + cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return [iv.toString('hex'), authTag, enc].join(":")
}

const decryptToken = (token) => {
  const [ivHex, authTagHex, enc] = token.split(":")
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(algo, key, iv)
  decipher.setAuthTag(authTag)

  const dec = decipher.update(enc, 'hex', 'utf8') 
    + decipher.final('utf8')
  return JSON.parse(dec)
}

const checkToken = (encToken) => {
    if (!encToken) return
    
    const user = decryptToken(encToken)
    if (user.expiresAt < Date.now()) return

    return user
}

const verify = (req, res, next) => {
  try {
    const user = checkToken(req.cookies.token)
    if (!user) return res.sendStatus(401)
    
    req.user = user
		next()
	} catch (err) {
    console.error(err)
    res.sendStatus(400)
  }
}

module.exports = {
    verify, checkToken, encryptToken, middleware
}