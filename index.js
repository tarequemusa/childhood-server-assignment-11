const express = require('express');
const cors = require('cors');
const {MongoClient, ServerApiVersion} = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.g5abh6e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run () {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const db = client.db("childhood_toys");
        const dollsCollection = db.collection("childhood");
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        app.post("/addToy", async (req, res) => {
            const body = req.body;
            const result = await dollsCollection.insertOne(body);
            console.log(result);
            res.send = result;
        });

        app.get("/alltoys/:disney", async (req, res) => {
            console.log(req.params.category);
            const result = await dollsCollection.find({category: req.params.disney}).toArray();
            console.log(result);
            return res.send(result);
        });

        app.get("/alltoys", async (req, res) => {
            const result = await dollsCollection.find().toArray();
            return res.send(result);
        });


        app.get("/myToys/:email", async (req, res) => {
            console.log(req.params.email);
            const result = await dollsCollection.find({postedBy: req.params.email}).toArray();
            res.send(result);
        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Childhood Server is running');
})

app.listen(port, () => {
    console.log(`Childhood Server is running on port ${ port }`);
})
