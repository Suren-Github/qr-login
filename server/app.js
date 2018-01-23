var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var sockets = require('./routes/sockets');

var app = express();

/** Mongoose code to connect to the mongo db */
var mongoose = require('mongoose');
mongoose.connect('mongodb://local/qrlogin');

app.set('mongoose', mongoose); 

var http = require('http').Server(app);
//var io = require('socket.io')(http);
global.io = require('socket.io')(http);

http.listen(3000, function(){
  console.log('listening on port:3000');
});


/** io connection - sockets */
io.on('connection', function(socket){
  
  /** Store the socket id in a global object to reuse it in the route's API calls */
  console.log("Client's Socket ID: ", socket.id);
  
  /** Register the user */
  socket.on('registerUser', function (data) {

      sockets.registerUser(data, socket.id).then((sessionId)=>{
        /** Session id is forwarded to the web to display the QR code */
        socket.emit('getSessionId', sessionId);
      })
      .catch((e) => {
        console.log("Exception in registering user: " + e);
      });
    
    });

});

/** For the POC - Consider, the mobile has logged in already and the 
 * access token has been stored in the DB
 * Here, we can use single access token in multiple devices, 
 * session will be maintatined for the user
 * Pass the token as static data */
sockets.initUser('A4589732-AS32984-0ASH3422-AFOSD32');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/** Routing - API requests */

/** Receives the mobile access token to update web login data*/
app.post('/api/MobileAccessToken', sockets.mobileAccessToken);


// catch 404 and forward to error handler
app.use(function(req, res, next) {

  var err = new Error('Not Found');

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  err.status = 404;
  next(err);

});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;