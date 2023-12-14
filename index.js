const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oqyepgg.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect to MongoDB and setup Collections
        await client.connect();

        const serviceCollection = client.db('carDoctor').collection('services');
        const bookingsCollection = client.db('carDoctor').collection('bookings');
        const contactCollection = client.db('carDoctor').collection('contact');
        const shopDataCollection = client.db('carDoctor').collection('shop');
        const cartCollection = client.db('carDoctor').collection('cart');

        // Routes

        // Get shop data from MongoDB
        app.get('/shop', async (req, res) => {
            const result = await shopDataCollection.find().toArray();
            res.send(result);
        });

        // Post cart items to DataBase
        app.post('/cart', async (req, res) => {
            const cart = req.body;
            const result = await cartCollection.insertOne(cart);
            res.send(result);
        });

        // Get Cart Data from DataBase
        app.get('/cart', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        });

        // Delete an item from the Cart
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });

        // Get services data from dataBank
        app.get('/services', async (req, res) => {
            const result = await serviceCollection.find().toArray();
            res.send(result);
        });

        // JWT verification
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h',
            });
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'none',
            }).send({ success: true });
        });

        // Post booking data to dataBank
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        });

        // Contact Data send to MongoDB:
        app.post('/contact', async (req, res) => {
            const contact = req.body;
            const result = await contactCollection.insertOne(contact);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 });
        console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
