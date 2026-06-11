require("dotenv").config();
const { MongoClient } = require("mongodb");

async function test() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);

    await client.connect();

    console.log("MONGODB DRIVER CONNECTED");

    await client.close();
  } catch (err) {
    console.error(err);
  }
}

test();