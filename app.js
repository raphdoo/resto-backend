const express = require("express");
const app = express();
const cors = require('cors');
const { Server } = require("socket.io")

const connectDb = require('./config/database');

const sessionStore = require('./middlewares/sessionStore')

app.use(cors());

const http = require('http').createServer(app);
const io = new Server(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Setting up config file
if (process.env.NODE_ENV !== 'PRODUCTION') require('dotenv').config({ path: 'config/config.env' })


//setup database
connectDb()

//store user session in mongoDB
const session = require("express-session")
const MongoDBStore = require("connect-mongodb-session")(session)

const store = new MongoDBStore({
    uri: process.env.DB_URI,
    collection: 'mySessions'
})

const sessionConfig = session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, secure: false, httpOnly: true }
})

app.use(sessionConfig)


const bodyParser = require('body-parser');


const errorMiddleWare = require('./middlewares/error');
const { connectSocket } = require("./config/connection");





app.use(express.json());
app.use(bodyParser.urlencoded({ extended:true }));


//Socket.io connection middleware
io.use(sessionStore(sessionConfig))
io.on("connection", connectSocket)
io.on('error', (err)=>{
    console.log(err.message)
})


//Error handling Middleware
app.use(errorMiddleWare);


module.exports = http;