const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const { mongoDB } = require("./config/db");
const { authRoutes } = require("./routes/authRoutes");
const { adminRoutes } = require("./routes/adminRoutes");
const { isAdmin, isLoggedin } = require("./middleware/authMiddleware");
const { cartRoutes } = require("./routes/cartRoutes");
const { Product } = require("./model/productModel");
const { orderRoutes } = require("./routes/orderRoutes");
dotenv.config();
mongoDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.Session_Key,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const allProducts = await Product.find();
  res.render("Home", {
    allProducts,
    success_msg: req.flash("success_msg"),
    error_msg: null,
  });
});

app.use("/auth", authRoutes);
app.use("/admin", isAdmin, adminRoutes);
app.use("/auth", isLoggedin, cartRoutes);
app.use("/order", isLoggedin, orderRoutes);

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Started at http://localhost:${PORT}`);
});
