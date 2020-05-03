const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const {HLTV} = require('./hltv');


const hltv = new HLTV();

hltv.init();

hltv.startHLTV();

// Init app
const app = express();

// Template folder
app.set('views', path.join(__dirname, 'views'));

// Serve static files 
app.use('/assets', express.static(path.join(__dirname, '/assets')))

// Use body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set rendering enginel current pugjs
app.set('view engine', 'pug');


/*
    USER ROUTES
*/

// Use user dashboard
app.use(require('./routes/publicRoutes'));


// Start app and listen on web port
app.listen(3000, () =>{
    console.log(`Web server started on port 3000 ...`);
});