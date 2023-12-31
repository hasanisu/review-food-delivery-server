const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("colors");

// middleWare
app.use(cors());
app.use(express.json());

// Data base connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dkggbgt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
}
run();




// Verify JWT

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).send({ message: "unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.status(403).send({ message: "unauthorize access" });
    }
    req.decoded = decoded;
    next();
  });
}

// JWT TOKEN
app.post("/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1day",
  });
  res.send({ token });
});

const Services = client.db("reviewDb").collection("services");
const Reviews = client.db("reviewDb").collection("reviews");

// creating different api connection link

app.get("/", (req, res) => {
  res.send("Review server is coming");
});

// For showing Limited Service
app.get("/services", async (req, res) => {
  try {
    const query = {};
    const result = await Services.find(query).limit(3).toArray();
    res.send({
      success: true,
      message: "data loaded successfully",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// For getting all Services
app.get("/allServices", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const query = {};
    const cursor = Services.find(query);
    const result = await cursor.skip(page*size).limit(size).toArray();
    const count = await Services.estimatedDocumentCount();
    res.send({
      success: true,
      message: "data loaded successfully",
      data: result,
      count: count,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// find by id api

app.get("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const result = await Services.findOne(query);
    res.send({
      success: true,
      message: "Successfully find this items",
      data: result,
    });
  } catch (error) {}
});

app.post("/services", async (req, res) => {
  try {
    const doc = req.body;
    const result = await Services.insertOne(doc);
    res.send({
      success: true,
      message: "Successfully inserted into the service list",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// get review from email
app.get("/reviews", verifyJWT, async (req, res) => {
  try {
    const decoded = req.decoded;
    if (decoded.email !== req.query.email) {
      res.status(403).send({ message: "unauthorized access" });
    }

    let query = {};
    if (req.query.email) {
      query = { userEmail: req.query.email };
    }

    const cursor = Reviews.find(query);
    const result = await cursor.toArray();

    res.send({
      success: true,
      message: "data loaded successfully",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// get review by particular id
app.get("/reviews/:id", async (req, res) => {
  try {
    const service_id = req.params.id;
    const query = { service_id: service_id };
    const data = { data_added: { $gt: new Date() } };
    const result = await Reviews.find(query, data).toArray();

    res.send({
      success: true,
      message: "data loaded successfully",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// Review post
app.post("/reviews", async (req, res) => {
  try {
    const doc = req.body;
    const result = await Reviews.insertOne(doc);

    res.send({
      success: true,
      message: "Thank you for your post",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});



// update reviews
app.get("/reviewsid/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await Reviews.findOne(query);
    res.send({
      success: true,
      message: "successfully find this service review",
      data: result,
    });
  } catch (error) {}
});




app.patch("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const docReview = req.body;

    const reviewsDoc = {
      $set: {
        rating: docReview.rating,
        review: docReview.review,
      },
    };
    const result = await Reviews.updateOne(filter, reviewsDoc, options);
    
    res.send({
      success: true,
      message: "successfully updated",
      data: result,
    });
  } catch (error) {}
});




app.delete("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await Reviews.deleteOne(query);
    res.send({
      success: true,
      message: "successfully deleted",
      data: result,
    });
  } catch (error) {}
});

app.listen(port, () => {
  console.log(`review server is running on port ${port}`);
});
