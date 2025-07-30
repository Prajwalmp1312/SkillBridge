import http, { createServer } from 'http'
import app from './app.js';

let server=createServer(app)

let Port=6000;

server.listen(Port,()=>{
    console.log(`Server is running on ${Port} 🚀`);
    
})