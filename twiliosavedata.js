
const kIceServersData = 'IceServersData';
const kIceServerStuns = 'IceServerStuns';
const kIceServerTurns = 'IceServerTurn';
const kTurnServerUserName = 'TurnServerUserName';
const kTurnServerPassword = 'TurnServerPassword';
const kTurnServersCreatedDate = 'TurnServersCreatedDate';

// Download the Node helper library from twilio.com/docs/node/install
// These vars are your accountSid and authToken from twilio.com/user/account
var accountSid = 'AC589a392c7fa0233a2b6917069bcc345f';
var authToken = "ef8c393b172fe4826a74cd418c63cdb2";
var client = require('twilio')(accountSid, authToken);

client.tokens.create({}, function(err, token) {
    process.stdout.write(token.username);
    console.log('twilio token.username: ' + token.username);
    console.log('twilio token.password: ' + token.password);
    console.log('twilio token.ttl: ' + token.ttl);
    console.log('twilio token.accountSid: ' + token.accountSid);
    console.log('twilio token.iceServers: ' + token.iceServers);
    console.log('twilio token.dateCreated: ' + token.dateCreated);
    console.log('twilio token.dateupdated: ' + token.dateupdated);
    console.log('twilio token.iceServers.length: ' + token.iceServers.length);
    var stunIndex = 0;
    var turnIndex = 0;
    var turnServers = [];
    var stunServers = [];
    var iceServersObject;
    for (var i=0; i<token.iceServers.length; i++)
    {
      console.log('for loop i: ' + i);
      var iceServer = token.iceServers[i];
      console.log('for loop iceserver turn: ' + iceServer.url);
      console.log('for loop iceserver turn Password: ' + iceServer.credential);
      console.log('for loop iceserver turn username: ' + iceServer.username);
      if (iceServer.username == null)
      {
        stunServers[stunIndex++] = iceServer.url;
      }
      else
      {
        turnServers[turnIndex++] = iceServer.url;
      }
    }
    iceServersObject = {TurnServerUserName: token.username, TurnServerPassword: token.password, TurnServersCreatedDate: token.dateCreated, IceServerStuns: stunServers, IceServerTurns: turnServers};
    console.log('iceServersObject b4 save stringify: ' + JSON.stringify(iceServersObject));
                     
                     
 var db_name = 'nodejspro';
 
 // new way 07-16-18
 var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
 ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
 mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
 mongoURLLabel = "";
 
 console.log('mongoURL 1: ', mongoURL);
 console.log('process.env.DATABASE_SERVICE_NAME: ', process.env.DATABASE_SERVICE_NAME);
 
 if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
 console.log('inside if process.env.DATABASE_SERVICE_NAME: ', process.env.DATABASE_SERVICE_NAME);
 var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
 mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
 mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
 mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
 mongoPassword = process.env[mongoServiceName + '_PASSWORD']
 mongoUser = process.env[mongoServiceName + '_USER'];
 
 if (mongoHost && mongoPort && mongoDatabase) {
 mongoURLLabel = mongoURL = 'mongodb://';
 if (mongoUser && mongoPassword) {
 mongoURL += mongoUser + ':' + mongoPassword + '@';
 }
 // Provide UI label that excludes user id and pw
 mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
 mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
 
 }
 }
 console.log('mongoURL 2: ', mongoURL);
 //var myDb;
 
 var db = null;
 
 if (mongoURL == null) return;
 
 var mongodb = require('mongodb');
 if (mongodb == null) return;
 var MongoClient = mongodb.MongoClient;
 
 console.log('mongodb version: ', require("mongodb/package").version);
 console.log('mongoURL 2: ', mongoURL);
 console.log('mongoServiceName: ', mongoServiceName);
 console.log('mongoHost: ', mongoHost);
 console.log('mongoPort: ', mongoPort);
 console.log('mongoDatabase: ', mongoDatabase);
 console.log('mongoPassword: ', mongoPassword);
 console.log('mongoUser: ', mongoUser);
 console.log('mongoURLLabel: ', mongoURLLabel);

                     
                     
MongoClient.connect(mongoURL, function (err, client) {
      var db = client.db(db_name);
                    
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('Connection established to', mongoURL);
        var iceServersDataCollection = db.collection(kIceServersData);
        iceServersDataCollection.remove({}, function(err, numberRemoved){
          console.log("inside remove iceServersDataCollection call back " + numberRemoved);
          iceServersDataCollection.insert(iceServersObject, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('Inserted iceServersObject:' + result);
            }
            client.close();
          });

        });
      }
    });
  })
