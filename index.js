const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

const corsConfig = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',

  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
  app.use(cors(corsConfig))

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


    //  JWT
      
   app.post('/jwt', async(req, res) =>{
    const user = req.body;
    console.log('user for token', user);
    const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
      expiresIn : '365d'
    })
    console.log(token);
    res
    .cookie('token', token,{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
    .send({ success: true})
    
   })

  //  clear token on logout
  app.get('/logout', async(req, res) =>{
    res
    .clearCookie('token',{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge:0,
    })
    .send({ success: true})
  })


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
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    })


    // update a job
    app.put('/job/:id', async(req, res) =>{
      const id = req.params.id;
      const jobData = req.body;
      const query = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateDoc = {
        $set:{
          ...jobData,
        },
      }
      const result = await jobsCollection.updateOne(query, updateDoc, options);
      res.send(result);
    })
    

    // getting applied jobs for a specific user

    app.get('/my-applied-jobs/:email', async (req, res) =>{
      const email = req.params.email;
      const query = {email}
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    })

    // delete a applied job
    app.delete('/my-applied-jobs/:id', async (req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bidsCollection.deleteOne(query);
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