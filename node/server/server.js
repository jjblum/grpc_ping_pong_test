"use strict";

const PROTO_PATH = __dirname + "/../../ping_pong_pose.proto";

var _ = require('lodash');
var chance = require('chance').Chance(); // useful random object generator
var grpc = require('grpc');
var ping_pong_pose = grpc.load(PROTO_PATH).ping_pong_pose; // the package

var message_count = 0;
var SIMULATED_WAIT_TIME_MS = 1000; 
var last_call;

// implement the rpc method
function askForPose(call) {
  call.on('data', function (request) {
    console.log('server received message # ' + request.count);
    last_call = Date.now();
    var response = {count: request.count, 
                    timestamp: last_call, 
                    pose: [
                      chance.floating({min:0, max: 1}),
                      chance.floating({min:0, max: 1}),
                      chance.floating({min:0, max: 1})
                    ]};
    _.delay(function(response_) {
              call.write(response_)
            }, SIMULATED_WAIT_TIME_MS, response);
  });
  call.on('end', function () {

  });
  call.on('status', function () {

  });
}

function setupServer() {
  var server = new grpc.Server();
  server.addProtoService(ping_pong_pose.PingPongPose_Service.service, {askForPose: askForPose});
  server.bind('0.0.0.0:11411', grpc.ServerCredentials.createInsecure());
  console.log("starting ping pong pose server at port 11411");
  console.log("waiting for clients...");
  server.start();
}

function main() {
  setupServer();
}
if (require.main == module) {
  main();
}



