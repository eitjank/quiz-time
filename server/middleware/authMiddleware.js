const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    // If there's no token, proceed without authentication
    next();
  } else {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      // If the token is valid, set the user on the request object
      req.user = decoded;
      next();
    } catch (err) {
      // If the token is invalid, proceed without authentication
      next();
    }
  }
}

module.exports = authenticateUser;
