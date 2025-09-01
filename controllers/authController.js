const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User } = require("../model/userModel");
const { Product } = require("../model/productModel");
const { sendMail } = require("../utils/nodemailer");

// Show signup page
async function showSignUp(req, res) {
  res.render("Signup", {
    error_msg: null,
    success_msg: null,
  });
}

// Handle signup (send OTP instead of direct account creation)
async function handleSignUp(req, res) {
  const { name, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return res.render("Signup", {
      error_msg: "Passwords do not match",
      success_msg: null,
    });
  }

  if (role === "admin") {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.render("Signup", {
        error_msg: "Admin already exists",
        success_msg: null,
      });
    }
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("Signup", {
        error_msg: "Email already registered",
        success_msg: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min validity

    // create user with OTP (unverified)
    await User.create({
      name,
      email,
      password: hash,
      role,
      isVerified: false,
      otp,
      otpExpiry,
    });

    // send verification email
    await sendMail(
      email,
      "Cartify - Verify Your Account",
      `<h2>Welcome to Cartify 🛒</h2>
       <p>Your verification code is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    );
    return res.redirect("/auth/verify"); // take user to verification page
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Internal Server Error");
    return res.redirect("/auth/signup");
  }
}

// Show login page
async function showLogin(req, res) {
  res.render("Login", {
    success_msg: req.flash("success_msg"),
    error_msg: null,
  });
}

// Handle login (only for verified users)
async function handleLogin(req, res) {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    return res.render("Login", {
      error_msg: "Invalid email or password",
      success_msg: null,
    });
  }

  if (!findUser.isVerified) {
    return res.render("Login", {
      error_msg: "Please verify your account before logging in",
      success_msg: null,
    });
  }

  bcrypt.compare(password, findUser.password, (err, result) => {
    if (!result) {
      return res.render("Login", {
        error_msg: "Invalid email or password",
        success_msg: null,
      });
    }
    const token = jwt.sign(
      { email: findUser.email, id: findUser._id, role: findUser.role },
      process.env.Secret_Key
    );
    res.cookie("token", token);
    if (findUser.role === "admin") {
      req.flash("success_msg", "Login Successfull");
      return res.redirect("/admin/dashboard");
    }
    req.flash("success_msg", "Login Successfull");
    res.redirect("/auth/dashboard");
  });
}

// Show dashboard
async function showDashboard(req, res) {
  const products = await Product.find();
  res.render("Dashboard", {
    products,
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg"),
  });
}

// Search products
async function SearchProduct(req, res) {
  try {
    const query = req.query.q;
    let products = [];

    if (query) {
      products = await Product.find({
        $or: [
          { productName: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
        ],
      });
    }

    res.render("Search", {
      products,
      query,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
}

// Logout
async function handleLogout(req, res) {
  res.clearCookie("token");
  req.flash("success_msg", "Logout");
  res.redirect("/");
}

//Verify
async function showVerifyPage(req, res) {
  res.render("verify", {
    error_msg: req.flash("error_msg"),
    success_msg: req.flash("success_msg"),
  });
}

// ✅ NEW: Verify OTP Controller
async function handleVerify(req, res) {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    req.flash("error_msg", "User not found");
    return res.redirect("/auth/verify");
  }

  if (user.isVerified) {
    req.flash("success_msg", "User already verified, please login");
    return res.redirect("/auth/login");
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    req.flash("error_msg", "Invalid or expired OTP");
    return res.redirect("/auth/verify");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  req.flash("success_msg", "Account verified successfully! You can now login.");
  res.redirect("/auth/login");
}

module.exports = {
  showSignUp,
  handleSignUp,
  showLogin,
  handleLogin,
  showDashboard,
  SearchProduct,
  handleLogout,
  showVerifyPage,
  handleVerify, // added
};
