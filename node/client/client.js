"use strict";

const PROTO_PATH = __dirname + "/../../ping_pong_pose.proto";

var _ = require('lodash');
var grpc = require('grpc');
var ping_pong_pose = grpc.load(PROTO_PATH).ping_pong_pose; // the package
var ppp_client = new ping_pong_pose.PingPongPose_Service(
  //'192.168.1.169:11411',
  'localhost:11411',
  grpc.credentials.createInsecure()
  );


var client_message_count = 0;
var start_time = Date.now();
var current_time = Date.now();
var DEADLINE_MS = 200;
var deadline_object;


function runAskForPose() {
  //var call = ppp_client.askForPose({deadline: Date.now() + DEADLINE_MS});
  var call = ppp_client.askForPose();

  call.on('data', function (response) {
    clearTimeout(deadline_object);

    console.log("request-response took " + (Date.now() - current_time) + " ms." + 
      "  Total time passed = " + (Date.now() - start_time) + " ms");    
    current_time = Date.now();    

    // evaluate message ordering
    console.log("outgoing # " + client_message_count + "   incoming # " + response.count);

    // ping automatically after a pong    
    call.write({count: ++client_message_count, timestamp: Date.now()});
    deadline_object = _.delay(function() {call.cancel();}, DEADLINE_MS);
  })
  call.on('end', function () {

  });
  call.on('status', function (error) {
    if (error) {
      console.log("rpc call.on('status')...");
      call.end();
    }    
  });

  // initial ping
  call.write({count: ++client_message_count, timestamp: Date.now()});
  deadline_object = _.delay(function() {call.cancel();}, DEADLINE_MS);
}


process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log("WARNING: uncaught exception!!!");
    if (err.message === 'Cancelled') {
      console.log("   ping-pong rpc call was cancelled, likely due to deadline violation. Restarting...");
      runAskForPose();
    }   
    else {
      console.log("   Unkown error:");
      console.log(err);
    } 
})


function main() { 
  runAskForPose();  
}
if (require.main === module) {
  main();
}