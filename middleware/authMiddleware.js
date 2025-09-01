const jwt = require("jsonwebtoken");

function isLoggedin(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/auth/login')
  }
  try {
    const decoded = jwt.verify(token, process.env.Secret_Key);
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect('/auth/login')
  }
}

function isAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/auth/login')
  }
  try {
    const decoded = jwt.verify(token, process.env.Secret_Key);
    req.user = decoded; // store user info in request
    if (decoded.role === "admin") {
      return next(); // allow access to admin route
    } else {
      return res.redirect('/auth/login')
    }
  } catch (error) {
    return res.redirect('/auth/login')
  }
}

module.exports = {
  isLoggedin,
  isAdmin,
};
