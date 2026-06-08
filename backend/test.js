const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017")
  .then(() => {
    console.log("CONNECTED SUCCESSFULLY");
    process.exit(0);
  })
  .catch(err => {
    console.log("FAILED:", err);
    process.exit(1);
  });