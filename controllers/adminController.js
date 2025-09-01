const { Product } = require("../model/productModel");

async function showAdminPanel(req, res) {
  const products = await Product.find();
  res.render("adminDashboard", {
    products,
    success_msg: req.flash("success_msg"),
    error_msg: null,
  });
}

async function showProductPanel(req, res) {
  res.render("CreateProduct", {
    success_msg: null,
    error_msg: null,
  });
}

async function createProduct(req, res) {
  try {
    const { productName, description, price, category } = req.body;

    if (!req.file) {
      res.render("CreateProduct", {
        success_msg: null,
        error_msg: "Product image is required",
      });
    }

    const createdProduct = await Product.create({
      productName,
      description,
      price,
      category,
      productImage: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });
    req.flash("success_msg", "Product Created Successfully");
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.render("CreateProduct", {
      success_msg: null,
      error_msg: "Server Error",
    });
  }
}

async function showProduct(req, res) {
  const products = await Product.find();
  res.render("adminProduct", { products });
}

async function editPanel(req, res) {
  const id = req.params.id;
  const product = await Product.findById(id);
  res.render("editProduct", { product });
}

async function editProduct(req, res) {
  const id = req.params.id;
  const { productName, description, price, category } = req.body;

  const updateData = {
    productName,
    price,
    description,
    category,
  };

  // If image uploaded, add it
  if (req.file) {
    updateData.productImage = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  req.flash("success_msg", "Product Edited Successfully");
  res.redirect("/admin/dashboard");
}

async function deleteProduct(req, res) {
  const id = req.params.id;
  const deleteProduct = await Product.findOneAndDelete({ _id: id });
  req.flash("success_msg", "Product Deleted Successfully");
  res.redirect("/admin/dashboard");
}

module.exports = {
  showAdminPanel,
  showProductPanel,
  createProduct,
  showProduct,
  editPanel,
  editProduct,
  deleteProduct,
};
