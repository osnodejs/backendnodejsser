//apn test  06/18/18

 var apn = require('apn');
 
 var options = {
 token: {
 key: "AuthKey_CFVH3LS8VA.p8",
 keyId: "CFVH3LS8VA",
 teamId: "324HYEX329" //  FE4YU9EKKD  //developer
// teamId: "FE4YU9EKKD" //  FE4YU9EKKD  //developer
 },
 production: false
 };
 var apnProvider = new apn.Provider(options);
 //let deviceTokensimple = "2ba4623e901aca609d2bd6c2ce78e39717835679526a7cf10331776fcba48c13"
// let deviceTokenjfr = "5f15fc1a717beb0deedfb0bad3047901f5fae7d762f4364fcedd23584f081178"
//let deviceTokenjfr = "dae399f9d7d15d69c3b55f12ea2a965a8ccba1d14e28126dce9338880adc3d5f"
//let deviceTokenjfr = "29d2c6d52047ea1da6b014dca20a07232d73ce3f0800e1e29822c595a6da0b43"

//rem from andalada
let deviceTokenAndaladaIphone = "b8b2c182811af4d01a3fda059898efa5af98d44d24e0cf8d1cabc1c98b69c0ed"
//let deviceTokenIpadair = "8353587dbfcc3e62cd96ab14b8306cf9de04e1fc94b99a37ca7e97c3003a9222"
let deviceTokenAndaladaIpad = "f40385fb9b5a26a124b47c028043439cdaffdfdbe637f7e80e9a4b564531ed9d"
let deviceTokenAndaladaIphone2 = "1de4f7cb101b04c861778e5cd43c528ade40febe16d321b4f8f065b32227947a"

let deviceTokenjfrlab1 = "e5daaa96adaa4906085c60cfc63d104ecc404c9e1af6e392690847402270ca7d"

let deviceTokenapnobjclabipad = "15846da552fdb1f1c6c92caf78cafae010273a131d2760bfd02bb2ae7761c34b"
let deviceTokenapnobjclabiphone = "54c5110b4ead12560e634f6f831fa4493b4ca867c53920fb7241ce2dea90f9b6"

var deviceToken; // = deviceTokenjfr
// let deviceToken = deviceTokenIpadair3
 //let deviceToken = deviceTokensimple
deviceToken = deviceTokenapnobjclabipad
//deviceToken = deviceTokenapnobjclabiphone
//deviceToken = deviceTokenjfrlab1
//deviceToken = deviceTokenAndaladaIphone2
//deviceToken = deviceTokenAndaladaIpad

var appTopic;
//appTopic = "com.vectortable.apnobjclab";
appTopic = "com.64KTech.AppOne";
//appTopic = "com.vectortable.jfrwebsocketlab1";

var myUserData = {
    GrpObject: 'groupobject',
    key2: 'key2 sendre',
    key1: "key111",
    sender: 'ipad air sender',
    userid: '5b5102e0c078f90019b54b79,',
    chatType: 3,
    STM: 'single message'
    };

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
 note.sound = "ping.aiff";
note.alert = "\uD83D\uDCE7 \u2709 " + appTopic;
 //note.alert = "\uD83D\uDCE7 \u2709 msg from simple";
note.payload = myUserData;//{'messageFrom': 'John Appleseed'};
// note.topic = "com.vectortable.jfrwebsocketlab1";
 //note.topic = "com.64KTech.SimpleTest";
note.topic = appTopic;
//note.userData: myUserData;

 apnProvider.send(note, deviceToken).then( (result) => {
 // see documentation for an explanation of result
 console.log('apnProvder send result.sent ' + result.sent);
 console.log('apnProvder send result.failed ' + result.failed);
 console.log('apnProvder send result.failed.error ' + result.failed[0].error);
 console.log('apnProvder send result.failed.device ' + result.failed[0].device);
 console.log('apnProvder send result.failed.status ' + result.failed[0].status);
 console.log('apnProvder send result.failed statuscode ' + result.failed[0].statusCode)
 console.log('apnProvder send result.failed.status.description ' + result.failed[0].status.description);
 console.log('apnProvder send result.failed[0] ' + result.failed[0].failed);
 });


//apnProvider.send(note, deviceToken).then(function( result) {
//      console.log('apnProvder send result.sent ' + result.sent);
//      console.log('apnProvder send result.failed ' + result.failed);
//      console.log('apnProvder send result ' + result);
//                                         });

// end apn test

