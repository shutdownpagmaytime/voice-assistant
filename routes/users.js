// var express = require('express');
// var router = express.Router();

// router.get('/', function(req, res, next) {  
//   res.send('respond with a resource');
// });

// module.exports = router;
// var express = require('express'); 
// var router = express.Router();

// router.get('/', (req, res) => { res.send('users route') })

router.get('/dashboard', (req, res) => { 
    // get user data based on id and render it
    res.render('dashboard') 
});