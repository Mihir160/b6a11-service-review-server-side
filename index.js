const express = require('express');
const cors = require('cors');
require('dotenv').config();
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
        app.get('/servicesAll/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        //add services
        app.post('/servicesAll', async(req, res) =>{
            const addservices = req.body;
            const result = await serviceCollection.insertOne(addservices)
            res.send(result)
        })
     }
     finally{

     }
}

run().catch(err => console.log(err))
app.listen(port, () =>{
    console.log(`b6a11-service-review-server running on: ${port}`)
})