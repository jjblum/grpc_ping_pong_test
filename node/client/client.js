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


function runAskForPose() {
  var call = ppp_client.askForPose({deadline: Date.now() + 1500});

  call.on('data', function (response) {
    console.log("request-response took " + (Date.now() - current_time) + " ms." + 
      "  Total time passed = " + (Date.now() - start_time) + " ms");    
    current_time = Date.now();    

    // evaluate messages
    //console.log("outgoing # " + client_message_count + "   incoming # " + response.count);

    // TODO: also need to update the call deadline!
    console.log(call.getPeer());  
    console.log(call.prototype);

    // ping automatically after a pong    
    call.write({count: ++client_message_count, timestamp: Date.now()});
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
}

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log("WARNING: uncaught exception!!!");
    console.log(err)
})

function main() { 
  runAskForPose();  
}
if (require.main === module) {
  main();
}