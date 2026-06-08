const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://127.0.0.1:27017");

let db;

const connectDB = async () => {
  await client.connect();
  db = client.db("ecommerce");
  console.log("DB READY FOR QUERIES ✅");
};

const getDB = () => db;

module.exports = { connectDB, getDB };