const router = require('express').Router();
const config = require('../config');
const webConfig = require('../web/webconfig');


router.get('/', (req,res) =>{

    webConfig.allServers.forEach(srw =>{
        console.log(srw)
    });
    
    res.render('dashboard', {
        srws: webConfig.allServers
    });
});

router.get('/servers', (req,res) =>{

    webConfig.allServers.forEach(srw =>{
        console.log(srw)
    });
    
    res.render('servers', {
        srws: webConfig.allServers
    });
})

router.get('/staff', (req,res) =>{

    res.render('staff', {
        srws: webConfig.allServers
    });
})





module.exports = router;