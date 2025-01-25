const express = require('express') ;
const app = express() ;
const http = require('http') ;
const server = http.createServer(app) ;
const dotenv = require('dotenv') ;
dotenv.config() ;
const server_port = process.env.server_port || 3500 ;
app.get("/" , (req,res) => {
    return res.json({message:'App running successfully'}) ;
})
server.listen(server_port,() => {
    console.log(`Server running successfully on port ${server_port}`)
})
