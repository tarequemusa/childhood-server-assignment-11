const express = require('express');
const cors = require('cors');
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


//middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json());



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
        // await client.connect();
        // Send a ping to confirm a successful connection
        const db = client.db("childhood_toys");
        const dollsCollection = db.collection("childhood");


        app.get("/getToysByText/:text", async (req, res) => {
            const text = req.params.text;
            const indexKeys = {title: 1, category: 1}; // Replace field1 and field2 with your actual field names
            const indexOptions = {name: "titleCategory"}; // Replace index_name with the desired index name
            const result2 = await dollsCollection.createIndex(indexKeys, indexOptions);
            const result = await dollsCollection
                .find({
                    $or: [
                        {title: {$regex: text, $options: "i"}},
                        {category: {$regex: text, $options: "i"}},
                    ],
                })
                .toArray();
            res.send(result);
        });


        app.get('/toyDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}

            const options = {
                projection: {title: 1, price: 1, _id: 1, image: 1, description: 1, sellerName: 1, postedBy: 1, rating: 1, quantity: 1}
            }

            const result = await dollsCollection.findOne(query, options);
            res.send(result);
        })

        app.put("/updateToy/:id", async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = {_id: new ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    price: body.price,
                    quantity: body.quantity,
                    description: body.description,
                },
            };
            const result = await dollsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        app.post("/addToy", async (req, res) => {
            const body = req.body;
            const result = await dollsCollection.insertOne(body);
            res.send = result;
        });

        app.get("/alltoys/:disney", async (req, res) => {
            const result = await dollsCollection.find({category: req.params.disney}).toArray();
            return res.send(result);
        });

        app.get("/alltoys", async (req, res) => {
            const result = await dollsCollection.find().limit(20).toArray();
            return res.send(result);
        });


        app.get("/myToys/:email", async (req, res) => {
            const result = await dollsCollection.find({postedBy: req.params.email}).sort({price: -1}).toArray();
            res.send(result);
        })

        app.delete('/singleToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await dollsCollection.deleteOne(query);
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
