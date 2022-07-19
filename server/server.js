const path = require('path'),
      express = require('express'),
      session = require('express-session'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      errorhandler = require('errorhandler'),
      mongoose = require('mongoose');

const isProduction = process.env.NODE_ENV === 'production'
const app = express()
const publicPath = path.join(__dirname, '..', 'build')
const port = process.env.PORT || 3001

app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
app.use(require('method-override')())
app.use(session({ secret: 'henbane', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));
;

if (!isProduction) {
   app.use(errorhandler())
   mongoose.connect('mongodb://localhost/henban')
   mongoose.set('debug', true)
}
else {
   mongoose.connect(process.env.MONGODB_URI)
}

app.use(express.static(publicPath))

require('./models/wallet')
require('./models/drop')

app.use('/public', express.static('public'));
app.use(require('./routes'))
app.get('*', (req, res) => {
   res.sendFile(path.join(publicPath, 'index.html'))
})

app.use(function(req, res, next) {
   var err = new Error('Page not found.')
   err.status = 404
   next(err)
})

if (!isProduction) {
   app.use(function(err, req, res, next) {
      console.log(err.stack);

      res.status(err.status || 500);
      res.json({
         'errors': {
            message: err.message,
            error: err
         }
      })
   })
}

app.use(function(err, req, res, next) {
   res.status(err.status || 500)
   res.json({'errors': {
      message: err.message,
      error: {}
   }})
})

var server = app.listen(port, function() {
   console.log('Listening on port ' + server.address().port)
})

module.exports = app
