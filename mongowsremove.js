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
    //HURRAY!! We are connected. :)
    console.log('Connection established to', mongoURL);
    // do some work here with the database.
    // Get the documents collection
    var collection = db.collection('UsersInfoObject');
    //create user
    // var user1 = {name: 'admin', userid: 'adminid', deviceToken: '12345'};

    // // db.close();
    // // Insert some users
    // collection.insert([user1], function (err, result) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
    //   }
    //   //Close connection
    //   db.close();
    // });

    // collection.find().toArray(function (err, result) {
    //   if (err) {
    //     console.log(err);
    //   } else if (result.length) {
    //     console.log('Found:', result);
    //   } else {
    //     console.log('No document(s) found with defined "find" criteria!');
    //   }
    //   //Close connection
    //   db.close();
    // });


//remove all documents - records from collection or table

    var usersCollection = db.collection('UsersInfoObject');
    usersCollection.remove({}, function(err, numberRemoved){
      console.log("inside remove UsersInfoObject call back " + numberRemoved);
      // db.close();
    })

    var sysDataCollection = db.collection('SysDataCollection');
    sysDataCollection.remove({}, function(err, numberRemoved){
      console.log("inside remove sysDataCollection call back " + numberRemoved);
      // db.close();
    })

    var sysCollection = db.collection('SysUserData');
    sysCollection.remove({}, function(err, numberRemoved){
      console.log("inside remove SysUserData call back " + numberRemoved);
      // db.close();
    })


//    db.close();
    client.close();

  }
});
