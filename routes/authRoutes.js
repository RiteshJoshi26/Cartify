const express = require("express");
const {
  showSignUp,
  showLogin,
  handleSignUp,
  handleLogin,
  handleLogout,
  showDashboard,
  SearchProduct,
  showVerifyPage,
  handleVerify,
} = require("../controllers/authController");
const { isLoggedin } = require("../middleware/authMiddleware");
const authRoutes = express.Router();

authRoutes.get("/signup", showSignUp);
authRoutes.post("/signup", handleSignUp);
authRoutes.get("/login", showLogin);
authRoutes.post("/login", handleLogin);
authRoutes.get("/logout", handleLogout);
authRoutes.get("/verify", showVerifyPage);
authRoutes.post("/verify", handleVerify);
authRoutes.get("/product/search", SearchProduct);
authRoutes.get("/dashboard", isLoggedin, showDashboard);

module.exports = {
  authRoutes,
};
