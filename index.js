const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

const corsOption = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    Credential: true,
    optionSuccessStatus: 200,

}
app.use(cors(corsOption))
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1qruita.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
     const jobsCollection = client.db('jobPedia').collection('jobs')
     const bidsCollection = client.db('jobPedia').collection('bids')

    // getting all jobs data
     
    app.get('/jobs', async (req, res) =>{
      const result = await jobsCollection.find().toArray();
      res.send(result);
    })


    // getting single job data

    app.get('/job/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobsCollection.findOne(query);
      res.send(result);
    })


    // saving data of appliedJobs
    app.post('/bid', async(req, res) =>{
      const bidData = req.body;
      
      
      const result = await bidsCollection.insertOne(bidData);
      res.send(result);
    })

    // saving data of add job

    app.post('/job', async(req, res) =>{
      const jobData = req.body;
      
      
      const result = await jobsCollection.insertOne(jobData);
      res.send(result);
    })


    // geting jobs of specific user

    app.get('/jobs/:email', async (req, res) =>{
      const email = req.params.email;
      const query = {'buyer.email' : email}
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    })

    // delete a job

    app.delete('/job/:id', async (req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    })


 
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('hello from jobpedia server')
})

app.listen(port, () =>{console.log(`server in running on ${port}`);})