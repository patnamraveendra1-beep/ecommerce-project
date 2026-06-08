const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const users = [];

// REGISTER
router.post("/register", async (req, res) => {
try {
const { name, email, password } = req.body;

const hashedPassword = await bcrypt.hash(
  password,
  10
);

const user = {
  name,
  email,
  password: hashedPassword,
};

users.push(user);

res.json({
  message: "User Registered Successfully",
});

} catch (err) {
res.status(500).json({
error: err.message,
});
}
});

// LOGIN
router.post("/login", async (req, res) => {
try {
const { email, password } = req.body;

const user = users.find(
  (u) => u.email === email
);

if (!user) {
  return res.status(400).json({
    error: "User not found",
  });
}

const isMatch = await bcrypt.compare(
  password,
  user.password
);

if (!isMatch) {
  return res.status(400).json({
    error: "Invalid password",
  });
}

const token = jwt.sign(
  { email },
  "secretkey",
  { expiresIn: "1h" }
);

res.json({
  message: "Login Success",
  token,
});

} catch (err) {
res.status(500).json({
error: err.message,
});
}
});

// GET ALL USERS
router.get("/admin/users", (req, res) => {
console.log("USERS =", users);

res.json(users);
});

// DELETE USER
router.delete("/admin/users/:email", (req, res) => {
try {
const email = req.params.email;

console.log(
  "DELETE EMAIL =",
  email
);

const index = users.findIndex(
  (u) => u.email === email
);

console.log(
  "INDEX =",
  index
);

if (index === -1) {
  return res.status(404).json({
    error: "User not found",
  });
}

users.splice(index, 1);

res.json({
  message:
    "User deleted successfully",
});

} catch (err) {
res.status(500).json({
error: err.message,
});
}
});

module.exports = router;