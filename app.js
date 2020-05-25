const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const {HLTV} = require('./hltv');

const hltv = new HLTV();

hltv.init();

//hltv.startHLTV();


const con = mysql.createConnection({
    host: 'remotemysql.com',
    user: '2HJgsf76j3',
    password: '5IpUFNcTlu',
    database: '2HJgsf76j3',
});

con.connect();

con.on('error', (err) => {
    console.log(err);
})

con.query('SHOW TABLES', function(err, rows, fields) {
    if (err) throw err;
    console.log(rows[0].example); //Show 1
});

// Init app
const app = express();

// Template folder
app.set('views', path.join(__dirname, 'web/views'));

// Serve static files 
app.use('/assets', express.static(path.join(__dirname, 'web/assets')))

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


app.use((req, res, next) => {
    res.status(404);
    res.render('404', {ref: req.headers.referer});
});


// Start app and listen on web port
app.listen(3000, () =>{
    console.log(`Web server started on port 3000 ...`);
});