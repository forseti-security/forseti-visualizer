var PROTO_PATH = '../forseti-api/protos/explain.proto';
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
// Suggested options for similarity to existing grpc.load behavior
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// The protoDescriptor object has the full package hierarchy
var ex = protoDescriptor.explain;

let channel = process.env.FORSETI_SERVER_VM_CHANNEL;

console.log('channe', channel);
let res = new ex.Explain(channel, grpc.credentials.createInsecure());

var meta = new grpc.Metadata();
meta.add('handle', process.env.FORSETI_DATA_MODEL_HANDLE);

// console.log(ex);
// console.log(res);
console.log('channel', channel);
console.log('channel', process.env.FORSETI_DATA_MODEL_HANDLE);
let iamPrefix='user/garrettwong@gwongcloud.com';
console.log(iamPrefix);

// res.getAccessByMembers({
//     member_name: iamPrefix
// }, meta, function(first, second) {
//     console.log('success', first, second);
// }, function(err) {
//     console.log('error', err);
// });

// ref: https://grpc.io/docs/tutorials/basic/node/
//iamPrefix='user/garrettwong@gwongcloud.com';

let call2 = res.getAccessByMembers({
    member_name: iamPrefix,
    permission_names: ['iam.serviceAccounts.actAs'],
    expand_resources: true
}, meta);
call2.on('data', function (a, b) {
    console.log('a:', a);
    console.log('b:', b);
})
call2.on('end', function () {
    console.log('end');
});
