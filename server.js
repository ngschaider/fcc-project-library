'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

// Simple logger
app.use((req, res, next) => {
  console.log(req.method + " - " + req.path);
  next();
});

// Disable client-side caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
});

// Setting X-Powered-By Header
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "PHP 4.2.0");
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });


//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app); 

//404 Not Found Middleware
// Add this later so all routes are added before this one
setTimeout(() => {
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
}, 3000);


//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
});


module.exports = app; //for unit/functional testing
