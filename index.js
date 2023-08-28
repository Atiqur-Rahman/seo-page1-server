const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/Images');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Database user and password are given below
// DB_USER=uploadFiles
// DB_PASS=eUxDxIl39d5KOyZo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hhukhjd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        const fileCollection = client.db('seo-page1').collection('files');

        app.post('/upload', upload.array('file'), async (req, res) => {
            const result = await fileCollection.insertMany(req.files);
            res.send(`${result.insertedCount} documents were inserted`);
        });

        app.get('/upload', async (req, res) => {
            const query = {};
            const cursor = fileCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running My Node CRUD Server ');
});

app.listen(port, () => {
    console.log('server is running');
});
