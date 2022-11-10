const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

app.get('/',(req, res) =>{
    res.send('b6a11-service-review-server is running')
})




const uri = `mongodb+srv://${process.env.DD_USER}:${process.env.DB_PASSWORD}@cluster0.ky0svg6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
     try{
        const serviceCollection = client.db('ServiceReview').collection('services')
        const reviewCollection = client.db('ServiceReview').collection('review')
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray()
            
            res.send(services)
        })
        app.get('/servicesAll', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
        app.get('/servicesAll/:id',  async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        //add services
        app.post('/servicesAll',  async(req, res) =>{
            const addservices = req.body;
            const result = await serviceCollection.insertOne(addservices)
            res.send(result)
        })
        //review add
        app.post('/review',  async(req, res)=>{
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        app.get('/reviews/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await reviewCollection.findOne(query)
            res.send(result)
        })

        app.get('/review', async(req, res) =>{
          
            let query = {}
            if(req.query.serviceId){
                query = {
                    serviceId: req.query.serviceId
                }
            }
            const cursor = reviewCollection.find(query)
            const review = await cursor.sort({time:-1}).toArray()
            res.send(review)
        })

        

        //my review
        app.get('/reviews',verifyJWT, async(req, res) =>{
            const decoded = req.decoded;
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const review = await cursor.sort({time:-1}).toArray()
            res.send(review)
        })

        app.delete('/reviews/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })

        //update review
        app.patch('/reviewsupdate/:id',  async (req, res) => {
         
            const id = req.params.id;
            const reviews = req.body
            const { review } = reviews
            const query = {_id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    review: review
                },
            };
            const result = await reviewCollection.updateOne(query, updateDoc, options);
            res.send(result)
       
        })

        //jwt token create
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
           
        })

     }
     finally{

     }
}

run().catch(err => console.log(err))
app.listen(port, () =>{
    console.log(`b6a11-service-review-server running on: ${port}`)
})