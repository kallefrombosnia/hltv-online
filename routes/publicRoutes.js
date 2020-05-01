const router = require('express').Router();
const psTree = require('ps-tree');
const config = require('../config');


router.get('/', (req,res) =>{
    res.render('dashboard');
})


module.exports = router;