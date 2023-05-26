const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// const corsConfig = {
//   origin: "",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
// };
// app.use(cors(corsConfig));
// app.options("", cors(corsConfig));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkohjx0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("toyMania").collection("toys");

    // VIEW: Search Toy
    app.get("/toySearchByTitle/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection.find({ name: searchText }).toArray();
      console.log(result);
      return res.send(result);
    });

    // VIEW: Get Data
    app.get("/", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // VIEW: All Toys

    app.get("/allToys", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.limit(20).toArray();
      res.send(result);
    });

    // VIEW: ALL Toys ID
    app.get("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // VIEW:  Sort Data
    app.get("/myToySort", async (req, res) => {
      let query = {};
      const isTrue = req.query.isTrue;
      console.log(isTrue);
      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      if (isTrue === "false") {
        const result = await toyCollection
          .find(query)
          .sort({ price: -1 })
          .toArray();
        console.log(result);
        res.send(result);
        return;
      }

      const result = await toyCollection
        .find(query)
        .sort({ price: 1 })
        .toArray();
      console.log(result);
      res.send(result);
    });

    // VIEW: My Toys

    app.get("/myToys/:text", async (req, res) => {
      const text = req.params.text;
      if (text == "ascending") {
        const result = await toyCollection
          .find({ sellerEmail: mail })
          .sort({ price: 1 })
          .toArray();
        res.send(result);
      }
      if (text == "descending") {
        const result = await toyCollection
          .find({ sellerEmail: mail })
          .sort({ price: -1 })
          .toArray();
        res.send(result);
      }

      const result = await toyCollection.find({ sellerEmail: text }).toArray();
      res.send(result);
    });

    // VIEW: Add A Toy
    app.post("/addToy", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await toyCollection.insertOne(body);
      res.send(result);
    });

    // VIEW:  Update Toy Information

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const updateDoc = {
        $set: {
          price: body.price,
          description: body.description,
          quantity: body.quantity,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // VIEW:  Delete Toy
    app.delete("/deleteToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server listening on port : ${port}`);
});
