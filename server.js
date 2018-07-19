//07-16-18

//var express = require('express'),
//app     = express(),
//morgan  = require('morgan');
//
//Object.assign=require('object-assign')

//app.engine('html', require('ejs').renderFile);
//app.use(morgan('combined'))


var db_name = 'nodejspro';
var WebSocketServer = require('ws').Server;
//var http = require('http');
var send = require('send');
var wss;
//new signaling server
// var currentUserID = 1;
var currentGroupID = 1;
// var webRTCUserObjects =  [];  //webRTCUserObjects
var webRTCGroupObjects = [];
// var recycleGroupIDs = [];
// var recycleUserIDs = [];
var useridObjects = [];  //array contains ojbect with userid and ws only for book keeping

console.log('before required http');
//07-18-18 new
const http = require('http');
console.log('required http');
var server = http.createServer((request, response) => {
                  request.on('error', (err) => {
                             console.error(err);
                             response.statusCode = 200;//400;
                             response.end();
                             });
                  console.log('request.method received command: ', request.method);
                  response.statusCode = 200;
                  response.end();
                  }).listen(8080);




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



  

var myDb;
var webRTCDevices = [];
var candidates = [];
var aCallerObject;
var count102 = 0;
var count103 = 0;
var count201 = 0;
var count301 = 0;

var confirmWS;

// var anInstanceWS;

//command keys
// kFriendsList @"your friends"

const kTooLateCmd = 'TooLate';
const kGroupID = 'groupID';
const kGroupPW = 'groupPW';
const kExpiredList = 'expiredList';
const kInviteesSubscriptionExpired = 'InviteesExpired';  // cmd to send out to inviter a list of subsciptions expired invitees
const kVerifySubscriptionCmd = 'VerSub';   // command receive from device to request to verify if user did subscribe
const kIAPSharedSecret = '44b1912f2b154dd99b619d433a93a082';
// const kIAPVerifierCmd = 'IAPVerifierCmd';
const kBase64Reciept = 'Base64Receipt';
const kIAPVerified = 'IAPVerified';  //send back to device in response to kVerifySubscriptionCmd
const kIsTrialPeriod = 'trial';
const kExpired = 'expired';

const kIceServersData = 'IceServersData';
const keyCandidate = 'candidate';
const kSDPData = 'SDPData';
const kCandidateData = 'CandidateData';
const kWebRTCSignalJoin = 'WebRTCSignalJoin';
const kRejectsList = 'Rejects List';
const kRequestersList = 'Requesters List';
const kFriendsList = 'Friends list';
const kPeersList = 'your peers';
// const kUserIDAssigned = 'UserID Assigned';
const kSessionIDAssigned = 'SessionIDAssigned';
const kSendIceServersToPeer = 'SendIceServersToPeer';
const kJoinRequest = 'Join Request';
const kClientQuit = 'Client Quit';
const kReceivedMsg = 'Received Msg';
const kSendInviteFriends = 'Send Invite Friends';
const kJoinRTC = 'join';
// const kDataRTC = 'data';
const kJoinReplyCaller = 'joinreplycaller';
const kJoinReplyReceiver = 'joinreplyreceiver';
const kNew = 'new';
const kJoinReply = 'joinreply';
const kNewUserJoined = 'newuserjoined';  // command to send to all user in the user list except new user just joined
const kUsersListJoined = 'userslistjoined';  // command to send to a new user just joined
const kUserID = 'userID';

const keySessionID = 'sessionID';
// const kOtherUsersList = 'otheruserslist';
const kList = 'list';
const keyCommand = 'kCommand';
const kPeerID = 'peerID';
const kMessageData = 'messageData';
const kStartRTCMsg = 'StartRTCMsg';
const kJoinerReady4RTCMsg = 'JoinerReady4RTCMsg';
const kLogout = 'Logout';
const kFriendRequest = 'Friend Request';
const kApprovedFriends = 'ApprovedFriends';
const kRejectedFriends = 'RejectedFriends';
const kUnFriends = 'UnFriends';
const kClearRejectsList = 'ClearRejectsList';
const kDisconnect = 'Disconnect';
const kChatType = 'chatType';
// const keyAvatarURL = 'AvatarURL';

const kUpdateDeviceTokenCmd = 'updateDeviceToken';
const kCmdProfileUpdate = 'cmdprofileupdate';
const kRequest3Lists = 'Request3Lists';
const kCreateNewUser ='CreateNewUser';
const keyRejecterID = 'rejecterID';
const kUpdatedFriendsList = 'UpdatedFriendsList';
const kSendChatDeclinedNotification = 'SendChatDeclinedNoti';
const kFriendRequestNotFound = 'FriendRequestedNotFound';
const kAudioRingtones = 'ar';
const kVideoRingtones = 'vr';
const kTextRingtones = 'tr';
const kSendSingleTextCommand = 'SingleTextComand';
const kSingleTextSent = 'SingleTextSent';
const kChatTypeSingleText = 'ST';


 console.log('Connected to MongoDB version 111: ', require("mongodb/package").version);

//  07-17-18 for test


var db = null;
//dbDetails = new Object();

//var initDb = function(callback) {
console.log('inside funcgtioncallback mongoURL 3: ', mongoURL);
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

// disable for lab on proof of concept for webrtc signaling server
//MongoClient.connect(url, function (err, db) {
MongoClient.connect(mongoURL, function (err, client) {
                    // Client returned
                    db = client.db(mongoDatabase);
                    myDb = db;
                    if (err) {
                    console.log('Unable to connect to the mongoDB server. Error:', err);
                    } else {
                    //HURRAY!! We are connected. :)
                    console.log('Connection established to', mongoURL);
                    console.log('Connected to MongoDB version: ', require("mongodb/package").version);
                    console.log('Connected to MongoDB at sat 3:48pm: %s', mongoURL);
                    console.log('Connected to MongoDB version sat 3:48pm: %s', require("mongodb/package").version);
                    
                    /*
                     // for test mongo db with node setup - 07-08-18
                     var user1 = {name: 'db user1', userID: 'user0001'};
                     console.log('user1 before insert: ' + user1);
                     var collection = db.collection('UsersInfoObject');
                     console.log('after collection created');
                     collection.insert(user1, function (err, result) {
                     if (err) {
                     console.log(err);
                     } else {
                     console.log('1 Inserted %d documents into the "UsersInfoObject" collection. The documents inserted with "_id" are:', result.length, result);
                     }
                     // myDb.close();
                     });
                     // for test mongo db with node setup - 07-08-18
                     */
                    }
                    });
//}
// new way 07-16-18

//var server = http.createServer(function(request, response) {
//    console.log((new Date()) + ' Received request for ' + request.url);
//    // send(request, request.url).pipe(response);
//
//    var parts = request.url.split('/');
//    console.log('http received parts0: ' + parts[0] + ' parts1: ' + parts[1]);
//    console.log('http received parts:' + parts);
//    if (request.url == '/')
//    {
//      console.log('wslab initial connection request / id: ' + request.url);
//      send(request, 'myindex.html').pipe(response);
//    }
//    else if (request.url == '/client.js')
//    {
//      console.log('wslab request client.js: ' + request.url);
//      // // send(request, 'client.js').pipe(response);
//      // var WebSocket = require('ws')
//      // , ws = new WebSocket('ws://127.0.0.1:8080/');
//      // ws.on('open', function() {
//      //   console.log('ws.on open');
//      //     ws.send('something send from client.js');
//      // });
//      // ws.on('message', function(message) {
//      //
//      //     console.log('received from websocket server: %s', message);
//      // });
//    }
//    else if (request.url == '/wsclient.html')
//    {
//      send(request, 'wsclient.html').pipe(response);
//      console.log('wslab request wsclient.html: ' + request.url);
//    }
//    else if (parts[1] == 'join')
//    {
//      console.log('http server received join request message cmd #: ' + parts[1] + ' rm#: ' + parts[2]);
//      // var command = parts[1];
//      // var roomId = parts[2];
//      //
//      // var aCaller = new CallerInfoObject(roomId, '101', 1, []);
//      // var stringToSend = JSON.stringify(aCaller);
//      // console.log('stringtosend back: ' + stringToSend);
//      //
//      // response.statusCode = 200;
//      // response.setHeader('Content-Type', 'application/json');
//      // response.write(JSON.stringify(aCaller));
//      // response.end();
//      // // Note: the 2 lines above could be replaced with this next one:
//      // // response.end(JSON.stringify(responseBody))
//    }
//    console.log('wslab request.url: ' + request.url);
//
//    // response.writeHead(200, {'Content-Type': 'text/plain'});
//    //   response.write("Welcome to Node.js on OpenShift!\n\n");
//    //   response.end("Thanks for visiting us! \n");
//});//.listen(3000);
//
//server.listen( port, ip, function() {
//    console.log((new Date()) + ' Server is listening on port 8080');
//});

//apn test  06/18/18
/*
 var apn = require('apn');
 
 var options = {
 token: {
 key: "AuthKey_CFVH3LS8VA.p8",
 keyId: "CFVH3LS8VA",
 teamId: "324HYEX329"
 },
 production: false
 };
 
 var apnProvider = new apn.Provider(options);
 //let deviceTokensimple = "2ba4623e901aca609d2bd6c2ce78e39717835679526a7cf10331776fcba48c13"
 let deviceTokenjfr = "5f15fc1a717beb0deedfb0bad3047901f5fae7d762f4364fcedd23584f081178"
 let deviceToken = deviceTokenjfr
 //let deviceToken = deviceTokensimple
 
 var note = new apn.Notification();
 
 note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
 note.badge = 3;
 note.sound = "ping.aiff";
 note.alert = "\uD83D\uDCE7 \u2709 msg from jfrwebsocketlab1";
 //note.alert = "\uD83D\uDCE7 \u2709 msg from simple";
 note.payload = {'messageFrom': 'John Appleseed'};
 note.topic = "com.vectortable.jfrwebsocketlab1";
 //note.topic = "com.64KTech.SimpleTest";
 
 apnProvider.send(note, deviceToken).then( (result) => {
 // see documentation for an explanation of result
 console.log('apnProvder send result.sent ' + result.sent);
 console.log('apnProvder send result.failed ' + result.failed);
 console.log('apnProvder send result.failed.error ' + result.failed[0].error);
 console.log('apnProvder send result.failed.device ' + result.failed[0].device);
 console.log('apnProvder send result.failed.status ' + result.failed[0].status);
 console.log('apnProvder send result.failed statuscode ' + result.failed[0].statusCode)
 });
 
 */
 // end apn test

/*  07-18-18
var server = http.createServer(function(request, response) {
                               console.log((new Date()) + ' Received request for ' + request.url);
                               // send(request, request.url).pipe(response);
                               
                               var parts = request.url.split('/');
                               console.log('http received parts0: ' + parts[0] + ' parts1: ' + parts[1]);
                               console.log('http received parts:' + parts);
                               if (request.url == '/')
                               {
                               console.log('wslab initial connection request / id: ' + request.url);
                               send(request, 'myindex.html').pipe(response);
                               }
                               else if (request.url == '/client.js')
                               {
                               console.log('wslab request client.js: ' + request.url);
                               // // send(request, 'client.js').pipe(response);
                               // var WebSocket = require('ws')
                               // , ws = new WebSocket('ws://127.0.0.1:8080/');
                               // ws.on('open', function() {
                               //   console.log('ws.on open');
                               //     ws.send('something send from client.js');
                               // });
                               // ws.on('message', function(message) {
                               //
                               //     console.log('received from websocket server: %s', message);
                               // });
                               }
                               else if (request.url == '/wsclient.html')
                               {
                               send(request, 'wsclient.html').pipe(response);
                               console.log('wslab request wsclient.html: ' + request.url);
                               }
                               else if (parts[1] == 'join')
                               {
                               console.log('http server received join request message cmd #: ' + parts[1] + ' rm#: ' + parts[2]);
                               // var command = parts[1];
                               // var roomId = parts[2];
                               //
                               // var aCaller = new CallerInfoObject(roomId, '101', 1, []);
                               // var stringToSend = JSON.stringify(aCaller);
                               // console.log('stringtosend back: ' + stringToSend);
                               //
                               // response.statusCode = 200;
                               // response.setHeader('Content-Type', 'application/json');
                               // response.write(JSON.stringify(aCaller));
                               // response.end();
                               // // Note: the 2 lines above could be replaced with this next one:
                               // // response.end(JSON.stringify(responseBody))
                               }
                               
                               
                               console.log('wslab request.url: ' + request.url);
                               
                               // response.writeHead(200, {'Content-Type': 'text/plain'});
                               //   response.write("Welcome to Node.js on OpenShift!\n\n");
                               //   response.end("Thanks for visiting us! \n");
                               });//.listen(3000);

server.listen( port, ip, function() {
              console.log((new Date()) + ' Server is listening on port 8080');
              });
*/

wss = new WebSocketServer({
    server: server,
    autoAcceptConnections: false
});
wss.on('connection', function(ws)
{
  console.log("New connection");

  ws.on('message', function(message)
  {
    console.log('wslab new1 websocket server receive client message original: ' + message);  // stopped 10-26-16
    var myUserInfo = JSON.parse(message);
    // myUserInfo.ws = ws;

    console.log('wslabl myUserInfo after json.parse: ' + myUserInfo);
    // console.log('wslab after convert todict websocket server receive client name: ' + myUserInfo.name);
// determine if this is a new user
    if (myUserInfo.kCommand == kJoinRequest)
    {
      // console.log('new user request current clients.length: ' + clients.length);
      // myUserInfo.kCommand = kUserIDAssigned;
      // myUserInfo.userid = myUserInfo.userid; //currentAssignedID.toString();
      console.log('kJoinRequest myUserInfo.kCommand: ' + myUserInfo.kCommand);
      console.log('kJoinRequest myUserInfo.name: ' + myUserInfo.name);
      console.log('kJoinRequest myUserInfo.userid: ' + myUserInfo.userid);
      console.log('kJoinRequest myUserInfo.msg: ' + myUserInfo.msg);
      console.log('kJoinRequest myUserInfo.email: ' + myUserInfo.email);
      console.log('kJoinRequest myUserInfo.deviceToken: ' + myUserInfo.deviceToken);
      console.log('kJoinRequest myUserInfo.sessionID: ' + myUserInfo.sessionID);
      console.log('kJoinRequest myUserInfo.groupID: ' + myUserInfo.groupID);
      console.log('kJoinRequest myUserInfo.groupPW: ' + myUserInfo.groupPW);

      if (myUserInfo.groupID != '')  //invitee
      {
        console.log('kJoinRequest groupID is not blank');
        var aWebRTCGroupObject = getWebRTCGroupObjectGiven(myUserInfo.groupID, myUserInfo.groupPW);
        if (aWebRTCGroupObject != null)
        {
          console.log('kJoinRequest aWebRTCGroupObject is not null');
          // myUserInfo.kCommand = kUserIDAssigned;
          myUserInfo.kCommand = kSessionIDAssigned;
          myUserInfo.sessionID = myUserInfo.userid + generateRandomStringWithLen(3);
          console.log('command is kJoinRequest sessionID: ' + myUserInfo.sessionID);
          //send back assinged sessionID to new client
          ws.send(JSON.stringify(myUserInfo));  // can be omitted later  //07-24-16
        }
        else  // send too late command to invitee
        {
          console.log('send too late command to invitee');
          myUserInfo.kCommand = kTooLateCmd;
          ws.send(JSON.stringify(myUserInfo));
        }
      }
      else
      {
        //for inviter
        myUserInfo.kCommand = kSessionIDAssigned;
        myUserInfo.sessionID = myUserInfo.userid + generateRandomStringWithLen(3);
        console.log('command is kJoinRequest sessionID: ' + myUserInfo.sessionID);
        //send back assinged sessionID to new client
        ws.send(JSON.stringify(myUserInfo));  // can be omitted later  //07-24-16
      }


    }
    else if (myUserInfo.kCommand == kRequest3Lists)
    {
      console.log('kcommand kRequest3Lists userid: ' + myUserInfo.userid);

      //update useridObjects array
      var aUseridObject = new UseridObject(ws, myUserInfo.userid);
      useridObjects.push(aUseridObject);

      console.log('b4sendthreelists kcommand kRequest3Lists userid: ' + myUserInfo.userid);
      sendThreeLists(myUserInfo.userid, ws);


    }
    else if (myUserInfo.kCommand == kUpdateDeviceTokenCmd)  //update deviceToken only
    {
      console.log('kcommand kUpdateDeviceTokenCmd userid111: ' + myUserInfo.userid);
      console.log('kcommand kUpdateDeviceTokenCmd deviceToken111: ' + myUserInfo.deviceToken);

      ws.close();

      console.log('kcommand kUpdateDeviceTokenCmd ws set to nil');

      var collection = myDb.collection('UsersInfoObject');
      collection.updateOne(
        {userid: myUserInfo.userid, deviceToken: ''},  //critieria
        {
          $set: {deviceToken: myUserInfo.deviceToken}
        },function (err, result) {
          console.log('kCommand kUpdateDeviceTokenCmd updated err: ' + err);
        console.log('kCommand kUpdateDeviceTokenCmd updateMany');
      });

    }
    else if (myUserInfo.kCommand == kCmdProfileUpdate)  //update displayname only
    {
      console.log('kcommand kCmdProfileUpdate userid: ' + myUserInfo.userid);
      console.log('kcommand kCmdProfileUpdate displayname: ' + myUserInfo.name);

      ws.close();

      console.log('kcommand kCmdProfileUpdate ws set to nil');

      var collection = myDb.collection('UsersInfoObject');
      collection.updateMany(
        {userid: myUserInfo.userid},  //critieria
        {
          $set: {name: myUserInfo.name}
        },function (err, result) {
          console.log('kCommand kCmdProfileUpdate updated err: ' + err);
        console.log('kCommand kCmdProfileUpdate updateMany');
      });

    }
    else if (myUserInfo.kCommand == kCreateNewUser)  //update displayname only
    {
      console.log('kcommand kCreateNewUser userid: ' + myUserInfo.userid);
      console.log('kcommand kCreateNewUser displayname: ' + myUserInfo.name);
      console.log('kcommand kCreateNewUser email: ' + myUserInfo.email);
      console.log('kcommand kCreateNewUser deviceToken: ' + myUserInfo.deviceToken);
      ws.close();
      saveUserInfoObjectInMongoDB(myUserInfo);
      // ws.close();

    }
    else if (myUserInfo.kCommand == kVerifySubscriptionCmd)
    {
      console.log('kcommand kVerifySubscriptionCmd');

      var base64kString = myUserInfo.Base64Receipt;
      var userID = myUserInfo.userid;   // requester 's id'
      console.log('kcommand kVerifySubscriptionCmd userID:  ' + userID);
      var collection = myDb.collection('UsersInfoObject');
      collection.findOne({userid: userID}, function(err, result) {
        if (err) {
          console.log('kVerifySubscriptionCmd findOne record error' + err);
        }
        else if (result)
        {
          console.log('kVerifySubscriptionCmd result.userid: ' + result.userid);
          var expired = result.expired;
          var infoToSend = {kCommand: kIAPVerified, expired: expired};
          ws.send(JSON.stringify(infoToSend));
          updateAppStoreReceipt(userID, base64kString);
        }
        else
        {
          console.log('kVerifySubscriptionCmd found no one');
        }
      });
    }
    else if (myUserInfo.kCommand == kLogout)
    {
      console.log('kcommand kLogout');
      var collection = myDb.collection('UsersInfoObject');
      collection.remove({userid: myUserInfo.userid, deviceToken: myUserInfo.deviceToken}, function(err, numberRemoved){
        console.log("inside remove kLogout UsersInfoObject call back " + numberRemoved);
        if (err) {
          console.log('remove with error: ' + err);
        } else {
          console.log('remove no errro');
        }
        // db.close();
      })
    }
    else if (myUserInfo.kCommand == kFriendRequest)
    {
      console.log('kcommand kFriendRequest myuserinfo.email: ' + myUserInfo.email);
      var email = myUserInfo.email;  // requestee's email
      var requesterID = myUserInfo.userid;   // requester 's id'
      // var requesteeID = "somerequesteeid";

      var collection = myDb.collection('UsersInfoObject');

      // 08-31-16
      // get record for the requestee if any - otherwise send not registered user yet command message
      collection.findOne({email: email.toLowerCase()}, function(err, result) {
        if (err) {
          console.log('find requestee find you error' + err);
        } else if (result)
        {
          var requesteeID = result.userid;
          // var requesters = result.requesters;
          //   console.log('send kRequestersList updated friendsList kRequestersList find your requesters.length ' + requesters.length);
            console.log('kFriendRequest find requesteeID: ' + requesteeID);

            // determine is you are already Friends - look up requester record
            collection.findOne({userid: requesterID}, function(err, result) {
              if (err) {
                console.log('kFriendRequest findOne requester record error' + err);
              }
              else if (result)
              {
                var friends = result.friends;
                  console.log('kFriendRequest findOne requester  friends.length ' + friends.length);
                  console.log('kFriendRequest findOne requester  friends: ' + friends);
                  var foundFriend = new Boolean(false);
                  for (var i=0; i<friends.length; i++)
                  {
                    console.log('kFriendRequest friends_i');
                    if (requesteeID == friends[i])
                    {
                      console.log('kFriendRequest you are already friends so no need to do anything');
                      foundFriend = true;
                      break;
                    }

                  }

                  console.log('kFriendRequest after for loop to check if you are already friends');
                  if (foundFriend == false)
                  {
                    console.log('kFriendRequest not yet friend so create requester record');

                    collection.updateMany(
                      {email: email.toLowerCase()},  //critieria
                      {
                        $addToSet: {requesters: requesterID}   // record for user that I made requested to be a friend  - requestee
                      },function (err, numUpdated) {
                        console.log('kCommand kFriendRequest updated err: ' + err + ' numUpdated: ' + numUpdated);

                        console.log('dot notation kCommand kFriendRequest updateMany numUpdated: ' + numUpdated + ' err: ' + err + ' nModified: ' + numUpdated.result.nModified + ' n: ' + numUpdated.result.n);
                        var n = numUpdated.result.n;
                        var nModified = numUpdated.result.nModified;
                        console.log('n: ' + n + ' nModified: ' + nModified);
                        var requesteeInfo = numUpdated.result[0];
                        console.log('requesteeInfo: ' + requesteeInfo);

                        if (err)  // or numUpdated = 0
                        {
                          console.log('kFriendRequest updateMany with error: ' + err);
                        }
                        else if (n > 0) // did updated
                        {
                          // now send the updated to the requestee if the requestee is online currently
                            console.log('send requesters updated kRequestersList list requesteeWS is not null');
                            var requesteeWS = getWSGivenUserID(requesteeID);
                            if (requesteeWS != null)
                            {
                              console.log('requesteeWS is not null so send Requesters list');
                              // getDBUsersListGivenUserIDsList(requesters, requesteeWS, kRequestersList);
                              collection.findOne({email: email.toLowerCase()}, function(err, result) {
                                if (err) {
                                  console.log('find requestee after updatemany find you error' + err);
                                } else if (result)
                                {
                                  // var requesteeID = result.userid;
                                  var requesters = result.requesters;
                                    console.log('send kRequestersList updated friendsList kRequestersList find your requesters.length ' + requesters.length);
                                    // console.log('send kRequestersList updated friendsList kRequestersList find your requesteeID: ' + requesteeID);

                                    console.log('requesteeWS is not null so send Requesters');
                                    getDBUsersListGivenUserIDsList(requesters, requesteeWS, kRequestersList);

                                }
                              });  // for requestee updated requesters list



                            }

                        }
                        });
                  }
                  else
                  {
                    console.log('kFriendRequest already friend so do nothing or send a notification to inform as such');

                  }

              }
            });

        }
        else // email was not in the db so return FriendRequestedNotFound message
        {
          console.log('email was not in the db so return FriendRequestedNotFound message');

          var infoToSend = {kCommand: kFriendRequestNotFound, email: email};
          ws.send(JSON.stringify(infoToSend));

        }
      });
      // end of kFriendRequest

    }
    else if (myUserInfo.kCommand == kApprovedFriends)
    {
      console.log('kcommand kApprovedFriends');
      var list = myUserInfo.allList;
      var approverID = myUserInfo.userid;
      var collection = myDb.collection('UsersInfoObject');
      // var approveeCount = 0;
      for (var i=0; i<list.length; i++)
      {
        var approveeID = list[i].userid;
        console.log('kCommand kApprovedFriends for loop approveeID: ' + approveeID);
        collection.updateMany(
          {userid: approverID},  //critieria  get approver record to update friends array
          {
            // $push: {requesters: reqeusterID}
            $addToSet: {friends: approveeID},
            $pull: {requesters: approveeID}  //remove approvee from requesters array since already been approved
          },function (err, numUpdated) {
            console.log('kCommand kApprovedFriends updated for approver err: ' + err + ' numUpdated: ' + numUpdated);
          console.log('kCommand kApprovedFriends for approver updateMany i: ' + i + ' list.length- approvees: ' + list.length);
          if (i == list.length)
          {
            console.log('kApprovedFriends approver i=list.length-1 i: ' + i + ' list.length: ' + list.length);
            // now go ahead and send the updated frineds list to the approver
            collection.findOne({userid: approverID}, function(err, result) {
              if (err) {
                console.log('approver send new friendslist updated friendsList kApprovedFriends find you error' + err);
              }
              else if (result)
              {
                var friends = result.friends;
                  console.log('approver send kApprovedFriends updated friendsList kApprovedFriends find your friends.length ' + friends.length);
                  console.log('approver send kApprovedFriends updated friendsList kApprovedFriends find your friends: ' + friends);
                  getDBUsersListGivenUserIDsList(friends, ws, kUpdatedFriendsList);

                  //send update requesters list to approver only
                  var requesters = result.requesters;
                  console.log('kApprovedFriends send approver updated  find your requesters: ' + requesters);
                  if (requesters.length > 0)
                  {
                    getDBUsersListGivenUserIDsList(requesters, ws, kRequestersList);
                  }
                  else
                  {
                    var infoToSend = {kCommand: kRequestersList, allList: []};
                    ws.send(JSON.stringify(infoToSend));
                  }
              }
            });
          }  // if i==list.length

        });

        collection.updateMany(
          {userid: approveeID},  //critieria  get approvee record to update friends array
          {
            // $push: {requesters: reqeusterID}
            $addToSet: {friends: approverID}
            // $pull: {requesters: reqeusterID}  //remove from array
          },function (err, numUpdated) {
            console.log('kCommand kApprovedFriends for approvee updated err: ' + err + ' numUpdated: ' + numUpdated);
          console.log('kCommand kApprovedFriends for approvee updateMany');

          // here you can send to approvee the updated friends list
          // send approvee updated friendsList
          var approveeWS = getWSGivenUserID(approveeID);
          if (approveeWS != null)
          {
            console.log('send approvee updated friendsList kApprovedFriends  approveeWS is not null');
            collection.findOne({userid: approveeID}, function(err, result) {
              if (err) {
                console.log('send approvee updated friendsList kApprovedFriends find you error' + err);
              } else if (result)
              {
                var friends = result.friends;
                  console.log('send approvee updated friendsList kApprovedFriends find your friends.length ' + friends.length);
                  console.log('send approvee updated friendsList kApprovedFriends find your friends: ' + friends);
                  getDBUsersListGivenUserIDsList(friends, approveeWS, kUpdatedFriendsList);
              }
            });  // for rejectee updated friendslist
          }
        });

      }  // for loop
    }
    else if (myUserInfo.kCommand == kRejectedFriends)
    {
      console.log('kcommand kRejectedFriends');
      var list = myUserInfo.allList;
      var rejecterID = myUserInfo.userid;
      var collection = myDb.collection('UsersInfoObject');

      for (var i=0; i<list.length; i++)
      {
        var rejecteeID = list[i].userid;
        console.log('kCommand kRejectedFriends for loop rejecteeID: ' + rejecteeID);
        collection.updateMany(
          {userid: rejecteeID},  //critieria  get rejectee record to update rejects array
          {
            // $push: {requesters: reqeusterID}
            $addToSet: {rejects: rejecterID}
            // $pull: {requesters: reqeusterID}  //remove from array
          },function (err, numUpdated) {
            console.log('kCommand kRejectedFriends for rejectee updated err: ' + err + ' numUpdated: ' + numUpdated);
          console.log('kCommand kRejectedFriends for rejectee updateMany');

          // send rejecters list to rejectee
          collection.findOne({userid: rejecteeID}, function(err, result) {
          if (err) {
            console.log('kRejectedFriends send new friendslist updated rejects kRejectedFriends find you error' + err);
          }
          else if (result)
          {
            var rejects = result.rejects;
              console.log('kRejectedFriends send rejects: ' + rejects);
              var rejecteeWS = getWSGivenUserID(rejecteeID);
              getDBUsersListGivenUserIDsList(rejects, rejecteeWS, kRejectsList);
          }
        });
        });

        // send updated requesters list to rejecter  -- this process does not need to wait for sending rejecters list to individual rejectee
        collection.updateMany(
          {userid: rejecterID},  //critieria  get rejectee record to update rejects array
          {
            // $push: {requesters: reqeusterID}
            // $addToSet: {rejects: rejecterID}
            $pull: {requesters: rejecteeID}  //remove from array
          },function (err, numUpdated) {
            console.log('kCommand kRejectedFriends for rejecter removing requester updated err: ' + err + ' numUpdated: ' + numUpdated);
            if (i == list.length)
            {
              console.log('kRejectedFriends send updated requesters list to the rejecter now');
              collection.findOne({userid: rejecterID}, function(err, result) {
                if (err) {
                  console.log('kRejectedFriends send new requesters updated find you error' + err);
                }
                else if (result)
                {
                  var requesters = result.requesters;
                    console.log('kRejectedFriends send requesters updated  find your requesters: ' + requesters);
                    if (requesters.length > 0)
                    {
                      getDBUsersListGivenUserIDsList(requesters, ws, kRequestersList);
                    }
                    else
                    {
                      var infoToSend = {kCommand: kRequestersList, allList: []};
                      ws.send(JSON.stringify(infoToSend));
                    }


                }
              });
            }  // if i==list.length

        });  // updateMany for rejecter
      }
    }
    else if (myUserInfo.kCommand == kUnFriends)
    {
      console.log('kcommand kUnFriends');
      var rejecterID = myUserInfo.rejecterID;
      var collection = myDb.collection('UsersInfoObject');
        var rejecteeID = myUserInfo.userid; //list[i].userid;
        console.log('kCommand kUnFriends for loop rejecteeID: ' + rejecteeID);
        collection.updateMany(
          {userid: rejecterID},  //critieria  get rejecter record to update requesters array
          {
            $pull: {friends: rejecteeID}  //remove rejectee from requesters array since already not been approved
          },function (err, numUpdated) {
            console.log('kCommand kUnFriends updated for rejecter err: ' + err + ' numUpdated: ' + numUpdated);
          console.log('kCommand kUnFriends for rejecter updateMany');

          // send rejecter updated friendsList
          collection.findOne({userid: rejecterID}, function(err, result) {
            if (err) {
              console.log('send rejecter updated friendsList kUnFriends find you error' + err);
            } else if (result)
            {
              var friends = result.friends;
              console.log('send rejecter updated friendsList kUnFriends find your record' + result.length);
                console.log('send rejecter updated friendsList kUnFriends find your friends.length' + friends.length);
                console.log('send rejecter updated friendsList kUnFriends find your friends:' + friends);

                if (friends.length > 0)
                {
                  console.log('kUnFriends send rejecter the UpdatedFriendsList');
                  getDBUsersListGivenUserIDsList(friends, ws, kUpdatedFriendsList);
                }
                else
                {
                  var infoToSend = {kCommand: kUpdatedFriendsList, allList: []};
                  ws.send(JSON.stringify(infoToSend));
                }

            }
          });  // for rejecter updated friendslist
        });  //updateMany

        collection.updateMany(
          {userid: rejecteeID},  //critieria  get rejectee record to update rejects array
          {
            $pull: {friends: rejecterID}
            // $pull: {requesters: reqeusterID}  //remove from array
          },function (err, numUpdated) {
            console.log('kCommand kUnFriends for rejectee updated err: ' + err + ' numUpdated: ' + numUpdated);
          console.log('kCommand kUnFriends for rejectee updateMany');

          // send rejectee updated friendsList
          var rejecteeWS = getWSGivenUserID(rejecteeID);
          if (rejecteeWS != null)
          {
            console.log('send rejectee updated friendsList kUnFriends  rejecteeWS is not null');
            collection.findOne({userid: rejecteeID}, function(err, result) {
              if (err) {
                console.log('send rejectee updated friendsList kUnFriends find you error' + err);
              } else if (result)
              {
                var friends = result.friends;
                console.log('send rejectee updated friendsList kUnFriends find your record' + result.length);
                  console.log('send rejectee updated friendsList kUnFriends find your friends.length' + friends.length);
                  console.log('send rejectee updated friendsList kUnFriends find your friends:' + friends);

                  if (friends.length > 0)
                  {
                    console.log('kUnFriends send rejecter the UpdatedFriendsList');
                    getDBUsersListGivenUserIDsList(friends, rejecteeWS, kUpdatedFriendsList);
                  }
                  else
                  {
                    var infoToSend = {kCommand: kUpdatedFriendsList, allList: []};
                    rejecteeWS.send(JSON.stringify(infoToSend));
                  }
              }
            });  // for rejectee updated friendslist
          }
        });

      }
      else if (myUserInfo.kCommand == kClearRejectsList)
      {
        console.log('kcommand kClearRejectsList');
        // var list = myUserInfo.allList;
        var rejecteeID = myUserInfo.userid;
        var collection = myDb.collection('UsersInfoObject');
        console.log('kCommand kClearRejectsList for loop rejecteeID: ' + rejecteeID);
        collection.updateMany(
          {userid: rejecteeID},  //critieria  get rejecter record to update requesters array
          {
            $set: {rejects: []}
          },function (err, numUpdated) {
            console.log('kCommand kClearRejectsList updated for rejecter err: ' + err + ' numUpdated: ' + numUpdated);
          console.log('kCommand kClearRejectsList for rejecter updateMany');
        });

        }
        // else if (myUserInfo.kCommand == kSendChatDeclinedNotification)
        // {
        //   console.log('kSendInviteFriends kSendChatDeclinedNotification kcommand is: ' + myUserInfo.kCommand);
        //
        // }
    else if ((myUserInfo.kCommand == kSendChatDeclinedNotification) || (myUserInfo.kCommand == kSendSingleTextCommand))
    {
      // var user1 = {name: anUserInfo.name, userid: anUserInfo.userid, deviceToken: anUserInfo.deviceToken};
      confirmWS = ws;

      if (myUserInfo.kCommand == kSendChatDeclinedNotification)
      {
        console.log('kSendChatDeclinedNotification so close ws');
        ws.close();
      }

      console.log('kSendChatDeclinedNotification kSendChatDeclinedNotification kcommand is: ' + myUserInfo.kCommand);
      console.log('kSendChatDeclinedNotification myUserInfo: ' + myUserInfo);
      console.log('b4 send kSendChatDeclinedNotification kSendSingleTextCommand ws:  ' + ws + ' confirmWS: ' + confirmWS);
      // var list = myUserInfo{kFriendsList};   //myUserInfo.kFriendsList;
      var list = myUserInfo.allList;
      console.log('kcommand is kSendChatDeclinedNotification list: ' + list);
      // var collection = myDb.collection('UsersInfoObject');
      for (var i=0; i<list.length; i++)
      {
        var collection = myDb.collection('UsersInfoObject');
        var aUserId = list[i].userid;
        // var aDeviceToken = list[i].deviceToken;
        console.log('kSendChatDeclinedNotification aUserId: ' + aUserId);
        // console.log('ksendinvitefriends aDeviceToken: ' + aDeviceToken);
        // collection.find({userid: aUserId, deviceToken: aDeviceToken}).toArray(function (err, result) {
        collection.find({userid: aUserId}).toArray(function (err, result) {
          if (err) {
            console.log('kSendChatDeclinedNotification find friends error' + err);
          } else if (result.length) {
            console.log('kSendChatDeclinedNotification find Found:', result);
            console.log('kSendChatDeclinedNotification result[0]: ' + result[0]);

            console.log('myUserInfo: ' + myUserInfo);
            console.log('myUserInfo.sender: ' + myUserInfo.sender);
            console.log('b4 send myUserInfo.GrpObject.groupID: ' + myUserInfo.GrpObject.groupID);
            console.log('b4 send myUserInfo.GrpObject.groupPW: ' + myUserInfo.GrpObject.groupPW);
            console.log('b4 send myUserInfo.GrpObject.cat2: ' + myUserInfo.GrpObject.cat2);
            console.log('b4 send myUserInfo.GrpObject.chatType: ' + myUserInfo.GrpObject.chatType);

            for (var i=0; i<result.length; i++)
            {
              console.log('b4 send ws: ' + ws);
              var upsObject = {myWS: ws, singletext: myUserInfo.singletext ,sender:  myUserInfo.sender, userid: myUserInfo.userid, msg: myUserInfo.msg, myUserInfoObject: result[i], GrpObject: myUserInfo.GrpObject};
              sendNotification(upsObject);
            }


            // sendList(result);
          } else {
            console.log('kSendChatDeclinedNotification Not found with defined "find" criteria!');
          }
          });
      }

    }
    else if (myUserInfo.kCommand == kSendInviteFriends)
    {
      var expiredList = [];  // list of invitees that has subscription expired
      confirmWS = ws;
      console.log('kSendInviteFriends kSendChatDeclinedNotification kcommand is: ' + myUserInfo.kCommand);
      console.log('ksendinvitefriends myUserInfo: ' + myUserInfo);
      console.log('b4 send kSendSingleTextCommand ws:  ' + ws + ' confirmWS: ' + confirmWS);
      var list = myUserInfo.allList;
      console.log('kcommand is ksendinvitefriends list: ' + list);
      // var collection = myDb.collection('UsersInfoObject');
      for (var i=0; i<list.length; i++)
      {
        var collection = myDb.collection('UsersInfoObject');
        var aUserId = list[i].userid;
        var currentCount = i;
        // var aDeviceToken = list[i].deviceToken;
        console.log('ksendinvitefriends aUserId: ' + aUserId);
        // console.log('ksendinvitefriends aDeviceToken: ' + aDeviceToken);
        // collection.find({userid: aUserId, deviceToken: aDeviceToken}).toArray(function (err, result) {
        collection.find({userid: aUserId}).toArray(function (err, result) {
          if (err) {
            console.log('kSendInviteFriends find friends error' + err);
          } else if (result.length) {
            console.log('kSendInviteFriends find Found:', result);
            console.log('kSendInviteFriends result[0]: ' + result[0]);
            console.log('myUserInfo: ' + myUserInfo);
            console.log('myUserInfo.sender: ' + myUserInfo.sender);
            console.log('b4 send myUserInfo.GrpObject.groupID: ' + myUserInfo.GrpObject.groupID);
            console.log('b4 send myUserInfo.GrpObject.groupPW: ' + myUserInfo.GrpObject.groupPW);
            console.log('b4 send myUserInfo.GrpObject.cat2: ' + myUserInfo.GrpObject.cat2);
            console.log('b4 send myUserInfo.GrpObject.chatType: ' + myUserInfo.GrpObject.chatType);

            var firstObjectInvitee = result[0];
            if (firstObjectInvitee.expired == false)
            {
              for (var i=0; i<result.length; i++)
              {
                console.log('b4 send ws: ' + ws);
                var upsObject = {myWS: ws, singletext: myUserInfo.singletext ,sender:  myUserInfo.sender, userid: myUserInfo.userid, msg: myUserInfo.msg, myUserInfoObject: result[i], GrpObject: myUserInfo.GrpObject};
                sendNotification(upsObject);
              }
            }
            else
            {
              console.log('expiredList add entry email: ' + firstObjectInvitee.email);
              expiredList.push(firstObjectInvitee.email);
            }
            // test to see if time to send expiredList to inviter
            console.log('b4 calling isTimeToSendExpiredList currentCount: ' + currentCount + ' length: ' + list.length + '  expiredList.length: ' + expiredList.length);
            if (expiredList.length > 0)
            {
              isTimeToSendExpiredList(expiredList, currentCount, list.length, ws);
            }

          } else {
            console.log('kSendInviteFriends Not found with defined "find" criteria!');
          }
          });
      }  // for loop list.length

      // if (expiredList.length > 0)
      // {
      //   console.log('expiredList is not empty so send list to inviter to tell invitees to renew the subscriptions');
      //   sendExpiredListToInviter(expiredList, aWS);
      // }

    }
    else if (myUserInfo.kCommand == kWebRTCSignalJoin)  //not webrtc project 07-16-16
    {
      console.log('kWebRTCSignalJoin device: ' +  myUserInfo.device);
      console.log('kWebRTCSignalJoin sdp: ' + myUserInfo.sdp);
      var aSignalObject = new SignalObject(ws, myUserInfo.device, myUserInfo.sdp);
      webRTCDevices.push(aSignalObject);

      if (webRTCDevices.length == 2)
      {
        console.log('kWebRTCSignalJoin time to send sdp to all devices');
        var signalObject1 = webRTCDevices[0];
        var signalObject2 = webRTCDevices[1];

        var rtcObjToSend1 = {kCommand: kSDPData, keySDP: signalObject2.sdp};
        var rtcObjToSend2 = {kCommand: kSDPData, keySDP: signalObject1.sdp};

        signalObject1.myWs.send(JSON.stringify(rtcObjToSend2));
        signalObject2.myWs.send(JSON.stringify(rtcObjToSend1));

      }
    }
    else if (myUserInfo.kCommand == kDisconnect)   //disconnect a client
    {
      console.log('kCommand is kDisconnect');
      ws.close();  //added 08-22-16
      // closeAWS(ws);  //removed 08-22-16
    }
    else if (myUserInfo.kCommand == kJoinRTC)   //'join'   // 06-23-16 signal server protocols starts here
    {
      // myUserInfo is same as myObject
      var myObject = JSON.parse(message);
      console.log('kCommand is kJoinRTC original myObject: ' + JSON.stringify(myObject));
      console.log('kCommand is kJoinRTC original myObject.userID: ' + myObject.userID);
      console.log('kCommand is kJoinRTC original myObject.sessionID: ' + myObject.sessionID);
      //update myObject by assigning values
      // myObject.userID = currentUserID.toString();
      // currentUserID = currentUserID + 1;

      sendIceServersToPeer(ws);

      // determine if this is an initiator or a user wants to join an existing group
      var myWebRTCUserObject;
      var aWebRTCGroupObject;
      if (myObject.groupID == kNew)  // create new group
      {
        myObject.groupID = currentGroupID.toString();
        myObject.groupPW = generateRandomStringWithLen(5);
        currentGroupID = currentGroupID + 1;
        myWebRTCUserObject = new WebRTCUserObject(ws, myObject);
        aWebRTCGroupObject = new WebRTCGroupObject(myObject.groupID, myObject.groupPW);
        aWebRTCGroupObject.webRTCUserObjects.push(myWebRTCUserObject);
        webRTCGroupObjects.push(aWebRTCGroupObject);
        console.log('create new webrtc group groupID: creator: chatType: ' + myObject.groupID + '  ' + myObject.creator + '  ' + myObject.chatType);
      }
      else   // joining existing group
      {
        console.log('joing existing webrtc group groupID: ' + myObject.groupID);
        myWebRTCUserObject = new WebRTCUserObject(ws, myObject);
        aWebRTCGroupObject = getWebRTCGroupObjectGiven(myObject.groupID, myObject.groupPW);
        if (aWebRTCGroupObject != null)
        {
          console.log('kJoinRTC adding new myWebRTCUserObject to existing WebRTCGroupObject');
          aWebRTCGroupObject.webRTCUserObjects.push(myWebRTCUserObject);
        }
      }
      console.log('kCommand is kJoinRTC updated myObject: ' + JSON.stringify(myObject));

      // webRTCUserObjects.push(myWebRTCUserObject);
      // console.log('kCommand is kJoinRTC webRTCUserObjects count: ' + webRTCUserObjects.length);

      // send back with updated myUserObject data
      myObject.kCommand = kJoinReply;
      var objectToSend = {kCommand: kJoinReply, params: myObject};

      var stringToSend = JSON.stringify(objectToSend);
      console.log('send joinreply back stringtosend: ' + stringToSend);
      ws.send(stringToSend);

      sendNewUserJoinedCommand(myWebRTCUserObject);  //send others my sessionID  //need to send chatType so the inviter know how to stup proper ui
      sendUsersListJoinedCommand(myWebRTCUserObject);  //send to new user all other peers sessionIDs

      console.log('b4 sendThreeLists  myUserInfo.useID: ' + myUserInfo.userID);
      console.log('b4 sendThreeLists  myObject.useID: ' + myObject.userID);
      console.log('b4 sendThreeLists  myObject.groupID: ' + myObject.groupID);
      console.log('b4 sendThreeLists  myObject.groupPW: ' + myObject.groupPW);
      // sendThreeLists(myUserInfo.userID, myUserInfo.sessionID);
      // sendThreeLists(myUserInfo);
      // sendThreeLists(myObject);   // 08-01-16 now doing this in kRequest3Lists
    }
    else if (myUserInfo.kCommand == kJoinerReady4RTCMsg)
    {
      console.log('kJoinerReady4RTCMsg');
      // var joinerPeerID = getPeerIDGivenWS(ws);
      // sendStartRTCMsgToInitiators(myUserInfo);
      sendStartRTCMsgToInitiators(myUserInfo);

    }
    else if (myUserInfo.kCommand == kSDPData)
    {
      console.log('kCommand is kSDPData');
      // console.log('kCommand is kSDPData peerID: ' + myUserInfo.peerID);
      console.log('kCommand is kSDPData sessionID: ' + myUserInfo.sessionID);
      console.log('kCommand is kSDPData messageData: ' + myUserInfo.messageData);
      console.log('kCommand is kSDPData groupID: ' + myUserInfo.groupID + ' groupPW: ' + myUserInfo.groupPW);

      // var myPeerID = getPeerIDGivenWS(ws);
      var mySessionID = getSessionIDGivenWS(ws, myUserInfo.groupID, myUserInfo.groupPW);
      sendSDPDataToPeer(myUserInfo, mySessionID);
      //get ws from myUserInfo.peerID.  But the sender id should myPeerID

    }
    else if (myUserInfo.kCommand == kCandidateData)
    {
      console.log('kCommand is kCandidateData');
      // console.log('kCommand is kCandidateData peerID: ' + myUserInfo.peerID);
      console.log('kCommand is kCandidateData sessionID: ' + myUserInfo.sessionID);
      console.log('kCommand is kCandidateData messageData: ' + myUserInfo.messageData);
      console.log('kCommand is kCandidateData groupPW: ' + myUserInfo.groupPW);
      // var myPeerID = getPeerIDGivenWS(ws);
      var mySessionID = getSessionIDGivenWS(ws, myUserInfo.groupID, myUserInfo.groupPW);
      sendCandidateDataToPeer(myUserInfo, mySessionID);
      //get ws from myUserInfo.peerID.  But the sender id should myPeerID

    }
  });

  ws.on('close', function()
  {

    console.log('client disonnnect ws: ' + ws);
    removeUseridObjectGivenWS(ws);
    closeAWS(ws);

    //
    // // webrtc new myprotocols
    // // a client just disconnected so remove WebRTCUserObject from webRTCUserObjects array
    // var aDisconnectedObject = getWebRTCGroupObjectGivenWS(ws);
    // var aWebRTCGroupObject = aDisconnectedObject.webRTCGroupObject;
    // var aWebRTCUserObject = aDisconnectedObject.webRTCUserObject;
    //
    // aWebRTCGroupObject.webRTCUserObjects.splice(aWebRTCGroupObject.webRTCUserObjects.indexOf(aWebRTCUserObject), 1);
    // if (aWebRTCGroupObject.webRTCUserObjects.length == 0)
    // {
    //   console.log('remove webrtc group object since this is the last client or ws');
    //   webRTCGroupObjects.splice(webRTCGroupObjects.indexOf(aWebRTCGroupObject), 1);
    // }
    //
    // // need to come back on this later 07-27-16
    // if (webRTCGroupObjects.length == 0)
    // {
    //   console.log('reset currentGroupID to 1 ');
    //   currentGroupID = 1;
    // }

  });

  ws.on('error', function()
  {
    console.log('client ws error');
  });
  console.log('after wson completion');
});  //wss.on loop

function closeAWS(aWs)
{
  console.log('closeAWS ws: ' + aWs);

  // webrtc new myprotocols
  // a client just disconnected so remove WebRTCUserObject from webRTCUserObjects array
  var aDisconnectedObject = getDisconnectedObjectGivenWS(aWs);
  if (aDisconnectedObject != null)
  {
    var aWebRTCGroupObject = aDisconnectedObject.webRTCGroupObject;
    var aWebRTCUserObject = aDisconnectedObject.webRTCUserObject;

    aWebRTCGroupObject.webRTCUserObjects.splice(aWebRTCGroupObject.webRTCUserObjects.indexOf(aWebRTCUserObject), 1);
    if (aWebRTCGroupObject.webRTCUserObjects.length == 0)
    {
      console.log('remove webrtc group object since this is the last client or ws');
      webRTCGroupObjects.splice(webRTCGroupObjects.indexOf(aWebRTCGroupObject), 1);
    }

    // need to come back on this later 07-27-16
    if (webRTCGroupObjects.length == 0)
    {
      console.log('reset currentGroupID to 1 ');
      currentGroupID = 1;
    }
  }

}

function isTimeToSendExpiredList(expiredList, currentCount, totalCount, aWS)
{
  console.log('isTimeToSendExpiredList currentCount: ' + currentCount);
  if ((currentCount + 1) == totalCount)
  {
    // if (expiredList.length > 0)
    // {
      console.log('isTimeToSendExpiredList send list to inviter to tell invitees to renew the subscriptions');
      sendExpiredListToInviter(expiredList, aWS);
    // }
  }
}

function sendExpiredListToInviter(expiredList, aWS)
{
  console.log('sendExpiredListToInviter');

  if (aWS)
  {
    console.log('sendExpiredListToInviter ws is ok');
    var infoToSend = {kCommand: kInviteesSubscriptionExpired, expiredList: expiredList};
    aWS.send(JSON.stringify(infoToSend));
  }

}

function updateSubscriptionReceiptValidation(myIAPObject)
{
  // console.log('updateSubscriptionReceiptValidation userid: ' + userid + 'foo: ' + foo);
  // foo = true
  // this.userid = userid;
  // this.expired = expired;
  // this.trial = trial;

  console.log('updateSubscriptionReceiptValidation userid: ' + myIAPObject.userid);

  var collection = myDb.collection('UsersInfoObject');
  collection.updateMany(
    {userid: myIAPObject.userid},  //critieria
    {
      $set: {expired: myIAPObject.expired, trial: myIAPObject.trial}
    },function (err, numUpdated) {
      console.log('updateSubscriptionReceiptValidation updatemany updated err: ' + err + ' numUpdated: ' + numUpdated);

      // reset expired to false again for sandbox testers  11-17-16 need to remove this for production live
      require("child_process").exec('node mongowsexpiredfalse4Allemails.js').unref();
///private/tmp/mongowsexpiredfalse4Allemails.js
      // var exec = require('child_process').exec;
      // exec('node /Users/user1/vectortable/nodejsmac/mongowsexpiredfalse4Allemails.js', function callback(error, stdout, stderr){
      // // exec('sh /private/tmp/mongowsexpiredfalse4Allemails.js', function callback(error, stdout, stderr){
      //     // result
      //     console.log('updateSubscriptionReceiptValidation run mongowsexpiredfalse4allemails error: ' + error);
      // });

    });

}

function saveUserInfoObjectInMongoDB(anUserInfo)
{

  console.log('saveUserInfoObjectInMongoDB anUserInfo.userid:  ' + anUserInfo.userid);

  console.log('findRecordForUserIDFromDB name: ' + anUserInfo.name);
  var collection = myDb.collection('UsersInfoObject');
  collection.find({userid: anUserInfo.userid, deviceToken: anUserInfo.deviceToken}).toArray(function (err, result) {
  if (err) {
    console.log('findRecordForUserIDFromDB find  error' + err);
    // return null;
  } else if (result.length) {
    console.log('findRecordForUserIDFromDB find Found so not saved:', result);

  } else {
    console.log('kSendInviteFriends Not found so save now');

    // get one record so to get the expired property if existing
    collection.find({userid: anUserInfo.userid}).toArray(function (err, result) {
    if (err) {
      console.log('findRecordForUserIDFromDB find by only userid error' + err);
      // return null;
    } else if (result.length)  // same email login to different device so duplicate other fields to new insert
    {
      console.log('findRecordForUserIDFromDB find by only userid Found so get expired property: ', result);
      // myExpired = result[0].expired;
      console.log('findRecordForUserIDFromDB find by only userid Found so get expired property result[0].expired: ', result[0].expired);
      //save now
      console.log('saveUserInfoObjectInMongoDB not found user so insert this suer into db result.length not 0');
      // var user1 = {name: anUserInfo.name, userid: anUserInfo.userid, deviceToken: anUserInfo.deviceToken, email: anUserInfo.email, AvatarURL: anUserInfo.AvatarURL, requesters: [], friends: [], rejects: []};
      var user1 = {name: anUserInfo.name, userid: anUserInfo.userid, deviceToken: anUserInfo.deviceToken, email: anUserInfo.email, expired: result[0].expired , trial: true, requesters: result[0].requesters, friends: result[0].friends, rejects: result[0].rejects};
      // var collection = myDb.collection('UsersInfoObject');
      collection.insert(user1, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log('1 Inserted %d documents into the "UsersInfoObject" collection. The documents inserted with "_id" are:', result.length, result);
        }
        // myDb.close();
      });

    }
    else   // new record  // new user
    {
      //save now
      console.log('saveUserInfoObjectInMongoDB not found user so insert this suer into db result.length is 0');
      // var user1 = {name: anUserInfo.name, userid: anUserInfo.userid, deviceToken: anUserInfo.deviceToken, email: anUserInfo.email, AvatarURL: anUserInfo.AvatarURL, requesters: [], friends: [], rejects: []};
      var user1 = {name: anUserInfo.name, userid: anUserInfo.userid, deviceToken: anUserInfo.deviceToken, email: anUserInfo.email, expired: false , trial: true, requesters: [], friends: [], rejects: []};
      // var collection = myDb.collection('UsersInfoObject');
      collection.insert(user1, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log('2 Inserted %d documents into the "UsersInfoObject" collection. The documents inserted with "_id" are:', result.length, result);
        }
        // myDb.close();
      });
    }

    });



  }
  });



  // WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
}

function sendNotification(aUPSObject)
{
  var myUserInfoObject = aUPSObject.myUserInfoObject;  //this is the same as UserInfoPNObject in iOS side
  console.log('new1 sendNotification aUPSObject.msg: ' + aUPSObject.msg);
  console.log("new1 sendNotification myUserInfoObject.name " + myUserInfoObject.name);
  console.log("sendNotification myUserInfoObject.deviceToken " + myUserInfoObject.deviceToken);
  console.log('aUPSObject.sender: ' + aUPSObject.sender);
  console.log('aUPSObject.singletext: ' + aUPSObject.singletext);
  console.log('aUPSObject.GrpObject: ' + aUPSObject.GrpObject);
  console.log('aUPSObject.GrpObject.chatType: ' + aUPSObject.GrpObject.chatType);
  console.log('sendNotification aUPSObject.GrpObject.groupID: ' + aUPSObject.GrpObject.groupID);
  console.log('sendNotification aUPSObject.GrpObject.groupPW: ' + aUPSObject.GrpObject.groupPW);
  console.log('sendNotification aUPSObject.GrpObject.cat2: ' + aUPSObject.GrpObject.cat2);
  console.log('sendNotification aUPSObject.myWs: ' + aUPSObject.myWS);
  console.log('sendNotification confirmWS: ' + confirmWS);

  var audioFile = aUPSObject.GrpObject.chatType + '.caf';

  var myUserData = {
      GrpObject: aUPSObject.GrpObject,
      key2: aUPSObject.sender,
      key1: "key111",
      sender: aUPSObject.sender,
      userid: aUPSObject.userid,
      chatType: aUPSObject.GrpObject.chatType,
      STM: aUPSObject.singletext
  };

  console.log('sendNotification b4 agSender require: ');
  
// new apn 07-11-18
    
    var apn = require('apn');
    
    var options = {
    token: {
    key: "AuthKey_CFVH3LS8VA.p8",
    keyId: "CFVH3LS8VA",
    teamId: "324HYEX329"
    },
    production: false
    };
    
    var apnProvider = new apn.Provider(options);
//    //let deviceTokensimple = "2ba4623e901aca609d2bd6c2ce78e39717835679526a7cf10331776fcba48c13"
//    let deviceTokenjfr = "5f15fc1a717beb0deedfb0bad3047901f5fae7d762f4364fcedd23584f081178"
//    let deviceToken = deviceTokenjfr
//    //let deviceToken = deviceTokensimple
    
    let deviceToken = myUserInfoObject.deviceToken;
//    var myUserData = {
//    GrpObject: 'groupobject',
//    key2: 'key2 sendre',
//    key1: "key111",
//    sender: 'ipad air sender',
//    userid: 'MoK9Glw2j7cnOb7cjyaEuLa55AF3',
//    chatType: 3,
//    STM: 'single message'
//    };
    
    //var message = {
    //    alert: "Hi there you beautiful",
    //        // // sound: "default",
    //    priority: 'high',
    //    sound: audioFile,
    //    badge: 3,
    //    userData: myUserData
    //    };
    //
    var note = new apn.Notification();
    
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 3;
    note.sound = audioFile;//"ping.aiff";
    note.alert = aUPSObject.msg;//"\uD83D\uDCE7 \u2709 msg from jfrwebsocketlab1";
    //note.alert = "\uD83D\uDCE7 \u2709 msg from simple";
    note.payload = myUserData;//{'messageFrom': 'John Appleseed'};
    note.topic = "com.64KTech.AppOne";
    //note.topic = "com.64KTech.SimpleTest";
    //note.userData: myUserData;
    
    apnProvider.send(note, deviceToken).then( (result) => {
                                             // see documentation for an explanation of result
                                             console.log('apnProvder send result.sent ' + result.sent);
//                                             console.log('apnProvder send result.failed ' + result.failed);
//                                             console.log('apnProvder send result.failed.error ' + result.failed[0].error);
//                                             console.log('apnProvder send result.failed.device ' + result.failed[0].device);
//                                             console.log('apnProvder send result.failed.status ' + result.failed[0].status);
//                                             console.log('apnProvder send result.failed statuscode ' + result.failed[0].statusCode)
                                             console.log('apnProvder send b4 singletextconfirm ');
                                             if (aUPSObject.GrpObject.chatType == kChatTypeSingleText)
                                             {
                                                 console.log('apnProvder send singletextconfirm ');
                                                 sendSingleTextSentConfirm()
                                             }
                                             });
    
    
    // new  apn

}


function sendSingleTextSentConfirm()
{
  // console.log( "sendSingleTextSentConfirm myWs " + myWs );
  console.log( "sendSingleTextSentConfirm confirmWS " + confirmWS );

  var infoToSend = {kCommand: kSingleTextSent};
  confirmWS.send(JSON.stringify(infoToSend));
}

function sendIceServersToPeer(aWs)
{
  console.log('sendIceServersToPeer');
  var iceServersDataCollection = myDb.collection(kIceServersData);
  iceServersDataCollection.find().toArray(function (err, result) {
    if (err) {
      console.log(err);
    } else if (result.length) {
      console.log('iceServersDataCollection Found so send to peer:', result);
      var iceServersObject = result[0];
      var infoToSend = {kCommand: kSendIceServersToPeer, IceServersData: iceServersObject};
      aWs.send(JSON.stringify(infoToSend));

    } else {
      console.log('No iceServersDataCollection found with defined "find" criteria!');
    }
  });

}

console.log("Listening to " + ip + ":" + port + "...");

function getDisconnectedObjectGivenWS(aWs)
{
  console.log('getWebRTCGroupObjectGivenWS');
  var aDisconnectedObject;

  for (var i=0; i<webRTCGroupObjects.length; i++)
  {
    var aWebRTCGroupObject = webRTCGroupObjects[i];
    for (var j=0; j<aWebRTCGroupObject.webRTCUserObjects.length; j++)
    {
      var jWebRTCUserObject = aWebRTCGroupObject.webRTCUserObjects[j];
      if (jWebRTCUserObject.myWs == aWs)
      {
        console.log('getWebRTCGroupObjectGivenWS found ws');
        aDisconnectedObject = new DisconnectedObject(aWebRTCGroupObject, jWebRTCUserObject)
        return aDisconnectedObject;
      }
    }
  }
  console.log('getWebRTCGroupObjectGivenWS not found ws so return null');
  return null;
}

function getWebRTCGroupObjectGiven(groupID, groupPW)
{
  console.log('getWebRTCGroupObjectGiven groupID: ' + groupID + ' groupPW: ' + groupPW);
  for (var i=0; i<webRTCGroupObjects.length; i++)
  {
    var aWebRTCGroupObject = webRTCGroupObjects[i];
    if (aWebRTCGroupObject.groupID == groupID  && aWebRTCGroupObject.groupPW == groupPW)
    {
      console.log('getWebRTCGroupObjectGiven found a WebRTCGroupObject so return');
      return aWebRTCGroupObject;
    }
  }
  console.log('getWebRTCGroupObjectGiven not found a WebRTCGroupObject so return null');
  return null;

}

function DisconnectedObject(aWebRTCGroupObject, aWebRTCUserObject)
{
  console.log('DisconnectedObject');
  this.webRTCGroupObject = aWebRTCGroupObject;
  this.webRTCUserObject = aWebRTCUserObject;
}

// function GroupObject(groupID, groupPW, aWebRTCUserObject)
function WebRTCGroupObject(groupID, groupPW)
{
  console.log('create new WebGroupObject groupID: ' + groupID + 'groupPW: ' + groupPW );
  this.groupID = groupID;
  this.groupPW = groupPW;
  this.webRTCUserObjects = [];
}

function UserObject(aWs, userInfo1)
{
  this.myWs = aWs;
  this.userInfo = userInfo1;
  console.log('UserObject function userInfo.name: ' + this.userInfo.name);
  // this.myWs.send(JSON.stringify(this.userInfo));
}


function RTCObject(aWs, anInfo)
{
  this.myWs = aWs;
  this.info = anInfo;
  console.log('caller function this.info: ' + this.info);
  // this.myWs.send(JSON.stringify(this.userInfo));
}

function RTCCallerInfoObject(room_id, client_id, is_initiator, messages1, messages2)
{
  // this.result = 1;
  this.room_id = room_id;
  this.client_id = client_id;
  this.is_initiator = is_initiator;
  this.messages1 = messages1;
  this.messages2 = messages2;
  console.log('RTCCallerInfoObject creattion');
}

function RTCInfoObject(room_id, client_id, is_initiator, messages)
{
  // this.result = 1;
  this.room_id = room_id;
  this.client_id = client_id;
  this.is_initiator = is_initiator;
  this.messages = messages;
  console.log('RTCInfoObject creattion');
}

function messageObject(is_initiator, message)
{
  this.is_initiator = is_initiator;
  this.message = message;

}

// function broadcastPeerslist()
// {
//   console.log('broadcastPeerslist clients.length: ' + clients.length);
//   // {kCommand:kJoinRequest, name:'blank', userid:'new', msg:'blank', receivers:[]};
//   var listToSend = gettingAllUsersList();
//   var infoToSend = {kCommand: kPeersList, allList: listToSend};
//     wss.clients.forEach(function each(client){
//       console.log('broadcastPeerslist b4 send data');
//       client.send(JSON.stringify(infoToSend));
//     });
// }

// function sendFriendslist(myUserInfo)
// function sendThreeLists(myUserInfo)  //friends, requesters, rejects  //7-24-16
// function sendThreeLists(userid, sessionID)  //friends, requesters, rejects
// function sendThreeLists(aUserInfo)  //friends, requesters, rejects
function sendThreeLists(userid, aWs)  //friends, requesters, rejects
{
// var user1 = {name: anUserInfo.name, userid: anUserInfo.userid, deviceToken: anUserInfo.deviceToken, email: anUserInfo.email, requesters: [], friends: [], rejects: []};
  console.log('sendThreeLists userid: ' + userid);
  // console.log('sendThreeLists sessionID: ' + aUserInfo.sessionID);
  // console.log('sendThreeLists groupID: ' + aUserInfo.groupID);
  // console.log('sendThreeLists groupPW: ' + aUserInfo.groupPW);
  // console.log('sendThreeLists clients.length: ' + clients.length);

  var collection = myDb.collection('UsersInfoObject');
  // collection.find({userid: myUserInfo.userid, deviceToken: myUserInfo.deviceToken}).toArray(function (err, result) {
  // collection.findOne({userid: aUserInfo.userID}, function(err, result) {
  collection.findOne({userid: userid}, function(err, result) {
    if (err) {
      console.log('sendThreeLists find you error' + err);
    } else if (result)
    {
     console.log('sendThreeLists find your record name: ' + result.name);
      var friends = result.friends;
      var requesters = result.requesters;
      var rejects = result.rejects;
      console.log('sendThreeLists find your friends.length' + friends.length);
      console.log('sendThreeLists find your friends:' + friends);
      console.log('sendThreeLists find your requesters: ' + requesters);
      console.log('sendThreeLists find your rejects: ' + rejects);

      // getDBUsersListGivenUserIDsList(friends, aUserInfo, kFriendsList);
      // getDBUsersListGivenUserIDsList(requesters, aUserInfo, kRequestersList);
      // getDBUsersListGivenUserIDsList(rejects, aUserInfo, kRejectsList);

      getDBUsersListGivenUserIDsList(friends, aWs, kFriendsList);
      getDBUsersListGivenUserIDsList(requesters, aWs, kRequestersList);
      getDBUsersListGivenUserIDsList(rejects, aWs, kRejectsList);

    } else
    {
        console.log('sendThreeLists Not found with defined "find" criteria!');
        if (aWs)
        {
          console.log('send empty friendslist: ' + kFriendsList);
          var infoToSend = {kCommand: kFriendsList, allList: []};
          aWs.send(JSON.stringify(infoToSend));
        }
    }

  });

  // // {kCommand:kJoinRequest, name:'blank', userid:'new', msg:'blank', receivers:[]};
  // // var dbList = getAllUsersFromDBList();
  // getAllUsersFromDBList();
  // // var listToSend = getUsersInfoObjectListWithoutDeviceTokenData(dbList);
  // // if (listToSend.length != 0)
  // // {
  // //   var infoToSend = {kCommand: kFriendsList, allList: listToSend};
  // //     wss.clients.forEach(function each(client){
  // //       console.log('broadcastPeerslist b4 send data');
  // //       client.send(JSON.stringify(infoToSend));
  // //     });
  // // }
}

// function getDBUsersListGivenUserIDsList(useridsList, userid, sessionID, command)
// function getDBUsersListGivenUserIDsList(useridsList, aUserInfo, command)
function getDBUsersListGivenUserIDsList(useridsList, aWs, command)
{
  // console.log('getDBUsersListGivenUserIDsList begin userID to send to: ' + aUserInfo.userID);
  // console.log('getDBUsersListGivenUserIDsList begin sessionID to send to: ' + aUserInfo.sessionID);
  console.log('getDBUsersListGivenUserIDsList command is: ' + command);
  var count = 0;
  var total = useridsList.length;
  var dbList = [];
  var collection = myDb.collection('UsersInfoObject');

    console.log('getDBUsersListGivenUserIDsList useridslist.length: ' + total);
    
  for (var i=0; i<useridsList.length; i++)
  {
    console.log('getDBUsersListGivenUserIDsList inside for i: ' + i);
    var requesterID = useridsList[i];
    console.log('getDBUsersListGivenUserIDsList requesterID b4 findOne: ' + requesterID);
    // collection.find({userid: userid}).toArray(function (err, result) {
    collection.findOne({userid: requesterID}, function(err, result) {
      console.log('getDBUsersListGivenUserIDsList inside findOne b4 check for err result: ' + result);
      if (err) {
        console.log('getDBUsersListGivenUserIDsList 1 find you error' + err);
        // return dbList;
      } else if (result)
      {
        count = count + 1;
        console.log('getDBUsersListGivenUserIDsList 1 find dbrecord' + result);
        console.log('getDBUsersListGivenUserIDsList 1 find dbrecord result.userID: ' + result.userid);
        dbList.push(result);   //contains all property from db not just id
        console.log('getDBUsersListGivenUserIDsList 1 find dblist.length: ' + dbList.length);

        // // sendList(dbList, aUserInfo, command);
        // sendList(dbList, aWs, command);
        // wait for db to get all records before sending below

      } else
      {
          console.log('getDBUsersListGivenUserIDsList 1 Not found with defined "find" criteria!');
          // return dbList;
      }
      // wait for db to get all records before sending
      if (count == total)
      {
        console.log('getDBUsersListGivenUserIDsList command: ' + command + ' time to send dbList.length: ' + dbList.length);
        sendList(dbList, aWs, command);
      }

    });
  }
  // console.log('getDBUsersListGivenUserIDsList 1 dbList b4 return: ' + dbList.length);
  // return dbList;
}
// function getUsersInfoObjectListWithoutDeviceTokenData(list)
// {
//   // var infoToSend = {kCommand: kPeersList, allList: listToSend};
//   var newList = [];
//   for (var i=0; i<list.length; i++)
//   {
//     var aUser = {name: list[i].name, userid: list[i].userid, deviceToken: list[i].deviceToken};
//     newList.push(aUser);
//   }
//   console.log('getUsersInfoObjectListWithoutDeviceTokenData newlist.length: ' + newList.length);
//   return newList;
// }

// function getAllUsersFromDBList()
// {
//   console.log('getAllUsersFromDBList');
//   var usersCollection = myDb.collection('UsersInfoObject');
//   usersCollection.find().toArray(function (err, result) {
//   if (err) {
//     console.log('getAllUsersFromDBList' + err);
//     // return [];
//   } else if (result.length) {
//     console.log('getAllUsersFromDBList usersCollection Found:', result);
//     sendList(result);
//     // return result;
//   } else {
//     console.log('getAllUsersFromDBList No usersCollection found with defined "find" criteria!');
//     // return [];
//   }
// });
// }

// function sendList(dbList, aUserInfo, command)
function sendList(dbList, aWs, command)
{
  console.log('sendList dbList: ' + dbList);
  console.log('sendList dbList.length: ' + dbList.length);
  // console.log('sendList sessionID: ' + aUserInfo.sessionID);
  // console.log('sendList groupID: ' + aUserInfo.groupID);
  // console.log('sendList groupPW: ' + aUserInfo.groupPW);

  // var listToSend = getUsersInfoObjectListWithoutDeviceTokenData(dbList);
  if (dbList.length != 0)
  {
    console.log('sendList dbList is not 0');
    // var myWs = getWSGivenSessionID(aUserInfo.sessionID, aUserInfo.groupID, aUserInfo.groupPW);
    console.log('sendList dblist is not 0 found myWS');
    if (aWs)
    {
      console.log('sendList command: ' + command);
      var infoToSend = {kCommand: command, allList: dbList};
      aWs.send(JSON.stringify(infoToSend));
    }

      // wss.clients.forEach(function each(client){
      //   console.log('broadcastPeerslist b4 send data');
      //   client.send(JSON.stringify(infoToSend));
      // });
  }
}

function generateRandomStringWithLen(len)
{
  var pw = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, len);
  console.log('generated Password: ' + pw)
  return pw;
}

function WebRTCUserObject(aWs, myObject)
{
  this.myWs = aWs;
  this.myObject = myObject;
  console.log('WebRTCUserObject function myObject.groupID: ' + this.myObject.groupID);
  // this.myWs.send(JSON.stringify(this.userInfo));
}

function createIAPObject(userid, expired, trial)
{
  this.userid = userid;
  this.expired = expired;
  this.trial = trial;
  console.log('iapObject function this: ' + this);
}


//tell all initiators to start rtc msg seguence
function sendStartRTCMsgToInitiators(joinerUserInfo)
{
  console.log('sendStartRTCMsgToInitiators joinder.sessionID: ' + joinerUserInfo.sessionID);
  console.log('sendStartRTCMsgToInitiators joinder.groupID: ' + joinerUserInfo.groupID);
  console.log('sendStartRTCMsgToInitiators joinder.groupPW: ' + joinerUserInfo.groupPW);
  // var joinerWS = getWSGivenPeerID(joinerUserInfo.peerID);
  var aWebRTCGroupObject = getWebRTCGroupObjectGiven(joinerUserInfo.groupID, joinerUserInfo.groupPW);
  if (aWebRTCGroupObject != null)
  {
    var joinerWS = getWSGivenSessionID(joinerUserInfo.sessionID, joinerUserInfo.groupID, joinerUserInfo.groupPW);
    for (var i=0; i<aWebRTCGroupObject.webRTCUserObjects.length; i++)
    {
      var iWebRTCUserObject = aWebRTCGroupObject.webRTCUserObjects[i];
      if (iWebRTCUserObject.myWs != joinerWS)
      {
        console.log('send sendStartRTCMsgToInitiators');
        var objectToSend = {};
        objectToSend[keyCommand] = kStartRTCMsg;
        objectToSend[keySessionID] = joinerUserInfo.sessionID;
        var stringToSend = JSON.stringify(objectToSend);
        console.log('sendStartRTCMsgToInitiators stringtosend: ' + stringToSend);
        iWebRTCUserObject.myWs.send(stringToSend);
      }
    }
  }  // end of if aWebRTCGroupObject != null
}

//get WebRTCUserObject given a ws
function getWebRTCUserObjectGivenWS(aWs)
{
  console.log('getWebRTCUserObjectGivenWS');
  for (var i=0; i<webRTCUserObjects.length; i++)
  {
    var iWebRTCUserObject = webRTCUserObjects[i];
    if (iWebRTCUserObject.myWs == aWs)
    {
      console.log('getWebRTCUserObjectGivenWS found aWs');
        return iWebRTCUserObject;
    }
  }
  console.log('getWebRTCUserObjectGivenWS not found aWS so return null');
  return null;
}

// command to send to all users in the user list except new user just joined
// send other peers in my group my sessionID only if they are my friends

function sendNewUserJoinedCommand(newWebRTCUserObject)  // send to others user the new user info
{
  console.log('sendNewUserJoinedCommand newWebRTCUserObject.myObject.userID:  ' + newWebRTCUserObject.myObject.userID);
  console.log('sendNewUserJoinedCommand newWebRTCUserObject.myObject.sessionID:  ' + newWebRTCUserObject.myObject.sessionID);
  //  for (var aWUserObject in webRTCUserObjects)
  var aWebRTCGroupObject = getWebRTCGroupObjectGiven(newWebRTCUserObject.myObject.groupID, newWebRTCUserObject.myObject.groupPW);
  if (aWebRTCGroupObject != null)
  {
    var myUserID = newWebRTCUserObject.myObject.userID;
    console.log('sendNewUserJoinedCommand myUserID:  ' + myUserID);

    var collection = myDb.collection('UsersInfoObject');
    collection.find({friends: myUserID}).toArray(function (err, result) {
      if (err) {
        console.log('sendNewUserJoinedCommand areWeFriends find you error' + err);
      } else if (result)
      {
        console.log('sendNewUserJoinedCommand areWeFriends find your friends result.length: ' + result.length);
        // console.log('sendNewUserJoinedCommand areWeFriends aWebRTCGroupObject.webRTCUserObjects.length: ' + aWebRTCGroupObject.webRTCUserObjects.length);

          for (var i=0; i<aWebRTCGroupObject.webRTCUserObjects.length; i++)  // active user ws with same groupID and groupPW verified
          {
            var iWebRTCUserObject = aWebRTCGroupObject.webRTCUserObjects[i];
            console.log('decide if need to send newUserJoinedcommand iWebRTCUserObject.myObject.userID: ' + iWebRTCUserObject.myObject.userID);
            console.log('decide if need to send newUserJoinedcommand iWebRTCUserObject.myObject.sessionID: ' + iWebRTCUserObject.myObject.sessionID);
            var iWebUserID = iWebRTCUserObject.myObject.userID;
            for (var j=0; j<result.length; j++)   // my friends loop
            {
               var aFriendID = result[j].userid;
               console.log('newUserJoinedcommand aFriendID: ' + aFriendID);
               console.log('newUserJoinedcommand iUserID: ' + iWebUserID);
               if (aFriendID == iWebUserID)   // then send
               {
                  var objectToSend = {};
                  objectToSend[keyCommand] = kNewUserJoined;
                  //  objectToSend[kUserID] = newWebRTCUserObject.myObject.userID;
                  objectToSend[keySessionID] = newWebRTCUserObject.myObject.sessionID;
                  objectToSend[kChatType] = newWebRTCUserObject.myObject.chatType;
                  console.log('sendNewUserJoinedCommand sessionID: ' + objectToSend[keySessionID]);
                  //  var objectToSend = {kCommand: kNewUserJoined, kUserID: newWebRTCUserObject.myObject.userID};
                  var stringToSend = JSON.stringify(objectToSend);
                  console.log('sendNewUserJoinedCommand stringtosend: ' + stringToSend);
                  //  iWebRTCUserObject.myWs.send(stringToSend);
                  iWebRTCUserObject.myWs.send(stringToSend);
                  break;
               }  // end if frind compare
            }  // end of friends loop
            console.log('newUserJoinedcommand end of friends loop');
        }  //end of webRTCGroupObject.webRTCUserObjects loop
      }  // else result of query is valid
      else
      {
        console.log('sendNewUserJoinedCommand areWeFriends we are not friend - friends list is empty');
      }

    });  // end of db query

  }  // end of if aWebRTCGroupObject != null

}


function sendUsersListJoinedCommand(newWebRTCUserObject)   // //send to new user all other peers sessionIDs
{
  console.log('sendUsersListJoinedCommand newWebRTCUserObject.myObject.userID:  ' + newWebRTCUserObject.myObject.userID);
  var aWebRTCGroupObject = getWebRTCGroupObjectGiven(newWebRTCUserObject.myObject.groupID, newWebRTCUserObject.myObject.groupPW);
  if (aWebRTCGroupObject != null)
  {
    var list = [];  // will contain sessionIDs of exisitng active users in the groupID
    console.log('sendUsersListJoinedCommand aWebRTCGroupObject.webRTCUserObjects.length' + aWebRTCGroupObject.webRTCUserObjects.length);
    var myUserID = newWebRTCUserObject.myObject.userID;
    var collection = myDb.collection('UsersInfoObject');
    collection.find({friends: myUserID}).toArray(function (err, result) {
      if (err) {
        console.log('sendUsersListJoinedCommand areWeFriends find you error' + err);
      } else if (result)
      {
        console.log('sendUsersListJoinedCommand areWeFriends find your friends' + result.length);

        for (var i=0; i<aWebRTCGroupObject.webRTCUserObjects.length; i++)
        {
          var iWebRTCUserObject = aWebRTCGroupObject.webRTCUserObjects[i];
          console.log('decide if need to include sendUsersListJoinedCommand iWebRTCUserObject.myObject.userID: ' + iWebRTCUserObject.myObject.userID);

          for (var j=0; j<result.length; j++)
          {
            if (iWebRTCUserObject.myObject.userID == result[j].userid)
            {
              list.push(iWebRTCUserObject.myObject.sessionID);
              break;
            }
          }  // for loop result friends
        }  // for loop webRTCUserObjects

        console.log('sendUsersListJoinedCommand list.length of id: ' + list.length);
        if (list.length > 0)
        {
          var objectToSend = {};
          objectToSend[keyCommand] = kUsersListJoined;
          objectToSend[kList] = list;

         //  var objectToSend = {kCommand: kUsersListJoined, kList: list};
          var stringToSend = JSON.stringify(objectToSend);
          console.log('sendUsersListJoinedCommand stringtosend: ' + stringToSend);
          // newWebRTCUserObject.myWs.send(stringToSend);
          newWebRTCUserObject.myWs.send(stringToSend);
        }

      }  // else if result
    }); // db query

  }  //if aWebRTCGroupObject != null

}


// function getPeerIDGivenWS(ws)
function getSessionIDGivenWS(ws, groupID, groupPW)
{
  console.log('getSessionIDGivenWS groupID: ' + groupID + ' groupPW: ' + groupPW);
  var aWebRTCGroupObject = getWebRTCGroupObjectGiven(groupID, groupPW);
  if (aWebRTCGroupObject != null)
  {
    for (var i=0; i<aWebRTCGroupObject.webRTCUserObjects.length; i++)
    {
      var iWebRTCUserObject = aWebRTCGroupObject.webRTCUserObjects[i];
      console.log('decide if need to include getPeerIDGivenWS iWebRTCUserObject.myObject.userID: ' + iWebRTCUserObject.myObject.userID);
      if (iWebRTCUserObject.myWs == ws)
      {
        console.log('send getPeerIDGivenWS peerid: ' + iWebRTCUserObject.myObject.userID);
        // return iWebRTCUserObject.myObject.userID;
        return iWebRTCUserObject.myObject.sessionID;
        break;
      }
    }
  }
  console.log('getPeerIDGivenWS not found ws  so return null');
  return null;
}

// command to send to a new user just joined a list of sessionIDs of all peers in the group but only if they are my friends

// send SDP data to a given peers
//get ws from myUserInfo.peerID.  But the sender id should myPeerID
// function sendSDPDataToPeer(aUserInfo, myPeerID)
function sendSDPDataToPeer(aUserInfo, mySessionID)
{
  // console.log('sendSDPDataToPeer myPeerID: ' + myPeerID);
  // console.log('sendSDPDataToPeer peerID: ' + aUserInfo.peerID);
  console.log('sendSDPDataToPeer messageData: ' + aUserInfo.messageData);
  console.log('sendSDPDataToPeer sessionID: ' + aUserInfo.sessionID);
  console.log('sendSDPDataToPeer groupID: ' + aUserInfo.groupID + ' groupPW: ' + aUserInfo.groupPW);

  // var peerWS = getWSGivenPeerID(aUserInfo.peerID);
  var peerWS = getWSGivenSessionID(aUserInfo.sessionID, aUserInfo.groupID, aUserInfo.groupPW);

  var objectToSend = {};
  objectToSend[keyCommand] = kSDPData;
  // objectToSend[kPeerID] = myPeerID;
  objectToSend[keySessionID] = mySessionID;
  objectToSend[kMessageData] = aUserInfo.messageData;
  var stringToSend = JSON.stringify(objectToSend);
  console.log('sendSDPDataToPeer stringtosend: ' + stringToSend);
  peerWS.send(stringToSend);

}

function sendCandidateDataToPeer(aUserInfo, mySessionID)
{
  console.log('sendCandidateDataToPeer mySessionID: ' + mySessionID);
  // console.log('sendCandidateDataToPeer peerID: ' + aUserInfo.peerID);
  console.log('sendCandidateDataToPeer messageData: ' + aUserInfo.messageData);
  console.log('sendCandidateDataToPeer aUserInfo.sessionID: ' + aUserInfo.sessionID);
  var peerWS = getWSGivenSessionID(aUserInfo.sessionID, aUserInfo.groupID, aUserInfo.groupPW);
  if (peerWS == null)
  {
    console.log('sendCandidateDataToPeer peerWs is null');
  }

  var objectToSend = {};
  objectToSend[keyCommand] = kCandidateData;
  // objectToSend[kPeerID] = myPeerID;
  objectToSend[keySessionID] = mySessionID;
  objectToSend[kMessageData] = aUserInfo.messageData;
  var stringToSend = JSON.stringify(objectToSend);
  console.log('sendCandidateDataToPeer stringtosend: ' + stringToSend);
  peerWS.send(stringToSend);

}
// function getWSGivenPeerID(aPeerID)
function getWSGivenSessionID(sessionID, groupID, groupPW)
{
  console.log('getWSGivenSessionID sessionID: ' + sessionID);
  var aWebRTCGroupObject = getWebRTCGroupObjectGiven(groupID, groupPW);
  if (aWebRTCGroupObject != null)
  {
    console.log('getWSGivenSessionID aWebRTCGroupObject.webRTCUserObjects.length: ' + aWebRTCGroupObject.webRTCUserObjects.length);
    for (var i=0; i<aWebRTCGroupObject.webRTCUserObjects.length; i++)
    {
      var iWebRTCUserObject = aWebRTCGroupObject.webRTCUserObjects[i];
      console.log(' getWSGivenSessionID iWebRTCUserObject.myObject.userID: ' + iWebRTCUserObject.myObject.userID);
      console.log('getWSGivenSessionID sessionID: ' + sessionID);
      // if (iWebRTCUserObject.myObject.userID == aPeerID)
      if (iWebRTCUserObject.myObject.sessionID == sessionID)
      {
        console.log('getWSGivenSessionID found ws for this ' + sessionID);
        return iWebRTCUserObject.myWs;
        break;
      }
    }

  }

  console.log('getWSGivenSessionID not found ws so return null');
  return null;
}

function UseridObject(aWs, userid)
{
  this.myWs = aWs;
  this.userid = userid;
  console.log('UseridObject function userid: ' + this.userid);
  // this.myWs.send(JSON.stringify(this.userInfo));
}

function getWSGivenUserID(userid)
{
  console.log('getWSGivenUserID userid: ' + userid);
  for (var i=0; i<useridObjects.length; i++)
  {
    var aUseridObject = useridObjects[i];
    console.log('getWSGivenUserID aUseridObject.userid: ' + aUseridObject.userid);
    if (userid == aUseridObject.userid)
    {
      console.log('getWSGivenUserID found ws for this ' + userid);
      return aUseridObject.myWs;
      break;
    }
  }
  console.log('getWSGivenUserID not found ws so return null');
  return null;
}

// func getUseridObjectGivenWS(aWs)
function removeUseridObjectGivenWS(aWs)
{
  console.log('removeUseridObjectGivenWS');
  var foundUseridObject;
  for (var i=0; i<useridObjects.length; i++)
  {
    var aUseridObject = useridObjects[i];
    console.log('removeUseridObjectGivenWS aUseridObject.userid: ' + aUseridObject.userid);
    if (aWs == aUseridObject.myWs)
    {
      foundUseridObject = aUseridObject;
      console.log('removeUseridObjectGivenWS found ws so breakout');
      break;
    }
  }
  if (foundUseridObject != null)
  {
    console.log('removeUseridObjectGivenWS removing one object with matched ws');
    // webRTCGroupObjects.splice(webRTCGroupObjects.indexOf(aWebRTCGroupObject), 1);

    useridObjects.splice(useridObjects.indexOf(foundUseridObject), 1);
  }
  console.log('removeUseridObjectGivenWS end of func');

}

function updateAppStoreReceipt(userID, base64kString)
{
    console.log('updateAppStoreReceipt userID: ' + userID);
    console.log('updateAppStoreReceipt kIAPSharedSecret :  ' + kIAPSharedSecret);
    
    console.log('Your subscription is still good');
    var is_trial_period = false;
    console.log('is_trial_period: ' + is_trial_period);
    var myIAPObject = new createIAPObject(userID, false, is_trial_period);
    updateSubscriptionReceiptValidation(myIAPObject);
    
    
 
}

//app.listen(port, ip);
//console.log('Server running on http://%s:%s', ip, port);

//module.exports = app ;
