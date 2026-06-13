require ("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
console.log("MY SERVER FILE LOADED");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();
const Razorpay = require("razorpay");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend API Running Successfully");
}); 
// MongoDB
console.log("MONGO_URI =", process.env.MONGO_URI);

const client = new MongoClient(process.env.MONGO_URI);
let db;
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// JWT Middleware
function verifyToken(req, res, next) {

console.log(
  "AUTH HEADER =",
  req.headers.authorization
);

const authHeader = req.headers.authorization;

if (!authHeader) {
  return res.status(401).json({
    error: "Token required",
  });
}

try {
  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET,
  );

  req.user = decoded;

  next();

} catch (err) {

  console.log(
    "JWT ERROR =",
    err.message
  );

  return res.status(401).json({
    error: "Invalid token",
  });
}
}

// ==================== AUTH ====================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await db
      .collection("users")
      .findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
    });

    res.json({
      message: "User Registered Successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
// REGISTER
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login Success",
      token,
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// ==================== PRODUCTS ====================

// Add Product
app.post("/api/products", async (req, res) => {

req.body.price = Number(req.body.price);

const result = await db
.collection("products")
.insertOne(req.body);

res.json({
message: "Product Added Successfully",
id: result.insertedId,
});

});

// Get Products
app.get("/api/products", async (req, res) => {
const products = await db
.collection("products")
.find({})
.toArray();

res.json(products);
});

// Get Single Product
app.get("/api/products/:id", async (req, res) => {
const product = await db
.collection("products")
.findOne({
_id: new ObjectId(req.params.id),
});

res.json(product);
});

// Update Product
app.put("/api/products/:id", async (req, res) => {
await db.collection("products").updateOne(
{
_id: new ObjectId(req.params.id),
},
{
$set: req.body,
}
);

res.json({
message: "Product Updated",
});
});

// Delete Product
app.delete("/api/products/:id", async (req, res) => {
await db.collection("products").deleteOne({
_id: new ObjectId(req.params.id),
});

res.json({
message: "Product Deleted",
});
});

// ==================== CART ====================

// Add To Cart
app.post("/api/cart", verifyToken, async (req, res) => {
const email = req.user.email;

const product = {
...req.body,
};
console.log("PRODUCT RECEIVED:",product);
delete product._id;

const existingItem = await db
.collection("cart")
.findOne({
email,
name: product.name,
});

if (existingItem) {
await db.collection("cart").updateOne(
{
_id: existingItem._id,
},
{
$inc: {
quantity: 1,
},
}
);
} else {
await db.collection("cart").insertOne({
email,
...product,
quantity: 1,
});
}

res.json({
message: "Added To Cart",
});
});
app.get("/api/cart", verifyToken, async (req, res) => {
const email = req.user.email;

const cartItems = await db
.collection("cart")
.find({ email })
.toArray();

res.json(cartItems);
});
// Remove Item
app.delete("/api/cart/:id", verifyToken, async (req, res) => {
await db.collection("cart").deleteOne({
_id: new ObjectId(req.params.id),
});

res.json({
message: "Item Removed",
});
});

// Quantity Update
app.put("/api/cart/:id", verifyToken, async (req, res) => {
const { quantity } = req.body;

await db.collection("cart").updateOne(
{
_id: new ObjectId(req.params.id),
},
{
$set: {
quantity,
},
}
);

res.json({
message: "Quantity Updated",
});
});
// ================= PAYMENT =================

app.post("/api/payment/create-order", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
// ================= PLACE ORDER =================

app.post("/api/orders", verifyToken, async (req, res) => {
const email = req.user.email;

const cartItems = await db
.collection("cart")
.find({ email })
.toArray();

if (cartItems.length === 0) {
return res.json({
message: "Cart Empty",
});
}

await db.collection("orders").insertOne({
email,
items: cartItems,
total: cartItems.reduce(
(sum, item) => sum + Number (item.price),
0
),
status: "Pending",
createdAt: new Date(),
});

await db.collection("cart").deleteMany({
email,
});

res.json({
message: "Order Placed Successfully",
});
});
app.get("/api/orders", verifyToken, async (req, res) => {
const email = req.user.email;

const orders = await db
.collection("orders")
.find({ email })
.toArray();

res.json(orders);
});

app.get("/api/admin/stats", async (req, res) => {
const products = await db
.collection("products")
.countDocuments();
console.log("PRODUCT COUNT =", products);
const orders = await db
.collection("orders")
.countDocuments();

const users = await db
.collection("users")
.countDocuments();

res.json({
products,
orders,
users,
});
});
app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await db
      .collection("orders")
      .find({})
      .toArray();

    console.log("ORDERS FOUND:", orders.length);

    res.json(orders);
  } catch (err) {
    console.log("ADMIN ORDERS ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await db
      .collection("users")
      .find({})
      .toArray();

    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
app.delete("/api/admin/users/:email", async (req, res) => {
  try {
    const result = await db
      .collection("users")
      .deleteOne({
        email: req.params.email,
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User Deleted Successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
app.delete("/api/admin/orders/:id", async (req, res) => {
  await db.collection("orders").deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.json({
    message: "Order Deleted Successfully",
  });
});
// ==================== TEST ====================

app.get("/test", (req, res) => {
console.log("TEST ROUTE HIT");
res.send("TEST WORKING");
});

// ==================== SERVER ====================

async function start() {
  try {
    await client.connect();

    db = client.db("ecommerce");

    console.log("DB CONNECTED SUCCESSFULLY ✅");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.log("MONGO ERROR:", err);
  }
}

start();