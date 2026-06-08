const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.log("DB ERROR ❌", err);
    process.exit(1);
  }
};

module.exports = connectDB;