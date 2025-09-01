const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    productImage: {
      data: Buffer,
      contentType: String, // will store the filename/path of image
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("product", productSchema);

module.exports = { Product };
