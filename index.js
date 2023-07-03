const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('colors');

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
  }
});

async function run() {
  try {
    
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold)
  }
}
run();



const Services =  client.db("reviewDb").collection("services");
const Reviews = client.db("reviewDb").collection("reviews")

// creating different api connection link

app.get('/', (req, res)=>{
    res.send('Review server is coming')
})

// For showing Limited Service 
app.get('/services', async(req, res)=>{
    try {
        const query ={}
        const result = await Services.find(query).limit(3).toArray();
        res.send({
            success:true,
            message: 'data loaded successfully',
            data: result,
        })
        
    } catch (error) {
        res.send({
            success:false,
            error: error.message
        })
    }
})
// For getting all Services 
app.get('/allServices', async(req, res)=>{
    try {
        const query ={}
        const result = await Services.find(query).toArray();
        res.send({
            success:true,
            message: 'data loaded successfully',
            data: result,
        })
        
    } catch (error) {
        res.send({
            success:false,
            error: error.message
        })
    }
})

// find by id api

app.get('/services/:id', async(req, res)=>{
    try {
        const {id} = req.params;
        const query = {_id: new ObjectId(id)}
        const result = await Services.findOne(query);
        res.send({
            success: true,
            message: 'Successfully find this items',
            data: result,
        })
        
    } catch (error) {
        
    }
})

app.post('/services', async (req, res) =>{
   try {
    const doc = req.body;
    const result = await Services.insertOne(doc);
    res.send({
        success: true,
        message: 'Successfully inserted into the service list',
        data: result
    })
    
   } catch (error) {
    res.send({
        success: false,
        error: error.message,
        
    })
   }

})


// Review Get
app.get('/reviews', async(req, res)=>{
    try {
        const query = req.query._id; 
        
        console.log(query)

        const result = await Reviews.find(query).toArray();
        res.send({
            success:true,
            message: 'data loaded successfully',
            data: result,
        })
        
    } catch (error) {
        res.send({
            success:false,
            error: error.message
        })
    }
})

// Review post 
app.post('/reviews', async (req, res) =>{
    try {
        const doc = req.body;
        const result = await Reviews.insertOne(doc)
        res.send({
            success: true,
            message: 'Thank you for your post',
            data: result
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
        
    }
})











app.listen(port, ()=>{
    console.log(`review server is running on port ${port}`)
})