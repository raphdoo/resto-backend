const http = require('./app');





//Handle Uncaught Exceptions
process.on('uncaughtException', err =>{
    console.log(`errorStack: ${err.stack}`);
    console.log(`Shutting down the server due to uncaught exceptions`);
    process.exit(1);
})


// Setting up config file
if (process.env.NODE_ENV !== 'PRODUCTION') require('dotenv').config({ path: 'config/config.env' })


const server = http.listen(process.env.PORT, () =>{
    console.log(`server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})

//Handle Unhandled Promise rejections
process.on('unhandledRejection', err => {
    console.log(`error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled Promise rejection`);
    server.close(() =>{
        process.exit(1)
    })
})