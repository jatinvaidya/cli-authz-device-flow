const express = require('express');
const app = express();

const expressJwt = require('express-jwt');
const expressJwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

require('dotenv').config();

const port = process.env.API_PORT || 9000;
if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
    throw ('please have all values in your .env file, refer to .env.sample');
}

const verifyAccessToken = expressJwt({
    // dynamically fetch and cache JWKS public key
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    // validate aud, iss claims
    audience: `${process.env.AUTH0_AUDIENCE}`,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
});

const checkReadScope = expressJwtAuthz(['read:data']);

app.get('/data', verifyAccessToken, checkReadScope, (req, res) => {
    res.send('Hello, Device! :-)');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(err.status).json({ message: err.message });
});

app.listen(port, () => {
    console.log(`Now listening on http://${process.env.API_HOST}:${process.env.API_PORT}`)
});

