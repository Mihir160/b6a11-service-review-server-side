const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

app.get('/',(req, res) =>{
    res.send('b6a11-service-review-server is running')
})

app.listen(port, () =>{
    console.log(`b6a11-service-review-server running on: ${port}`)
})