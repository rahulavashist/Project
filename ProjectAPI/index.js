const express = require("express")

const axios = require('axios');
const Image =require('./models/ImageModel')

require("./dbConnect")
const ImageRoutes = require("./routes/ImageRoutes")
const app = express()

app.use("/api/image",ImageRoutes)

var port = 8000
app.listen(port,()=>{
    console.log(`Server is Running at Port http://localhost:${port}`);
})


