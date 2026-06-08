const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
try {
const products = await Product.find();

res.json(products);

} catch (err) {
res.status(500).json({
message: err.message,
});
}
});

// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
try {
const product = await Product.findById(
req.params.id
);

if (!product) {
  return res.status(404).json({
    message: "Product not found",
  });
}

res.json(product);

} catch (err) {
res.status(500).json({
message: err.message,
});
}
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
try {
const updatedProduct =
await Product.findByIdAndUpdate(
req.params.id,
{
name: req.body.name,
price: req.body.price,
category: req.body.category,
image: req.body.image,
},
{
new: true,
}
);

if (!updatedProduct) {
  return res.status(404).json({
    message: "Product not found",
  });
}

res.json(updatedProduct);

} catch (err) {
res.status(500).json({
message: err.message,
});
}
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
try {
const product =
await Product.findByIdAndDelete(
req.params.id
);

if (!product) {
  return res.status(404).json({
    message: "Product not found",
  });
}

res.json({
  message:
    "Product Deleted Successfully",
});

} catch (err) {
res.status(500).json({
message: err.message,
});
}
});

module.exports = router;