/**
 * Get GRPC Client
 */
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

// protoPath = 'protos/explain.proto';
// config = {}
function getGrpcClient(protoPath, forsetiServerVmIpAddress, config) {
    config = config || {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }

    // Suggested options for similarity to existing grpc.load behavior
    var packageDefinition = protoLoader.loadSync(protoPath, config)

    var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

    // The protoDescriptor object has the full package hierarchy
    let channel = `${forsetiServerVmIpAddress}:50051`; // "35.212.33.44:50051"
    let explainClient = new protoDescriptor.explain.Explain(channel, grpc.credentials.createInsecure());
    return explainClient;
}

function getExplainClientMethods() {
    var protoPath = 'protos/explain.proto';
    var forsetiServerVmIpAddress = process.env.FORSETI_SERVER_VM_IP_ADDRESS || '35.232.70.205';
    var explainClient = getGrpcClient(protoPath, forsetiServerVmIpAddress)
    // console.log(Object.getOwnPropertyNames(explainClient))
    console.log(explainClient.constructor.prototype)
}

function getIamExplainResources() {
    var protoPath = 'protos/explain.proto';
    var forsetiServerVmIpAddress = process.env.FORSETI_SERVER_VM_IP_ADDRESS || '35.232.70.205';
    var forsetiModelId = process.env.FORSETI_DATA_MODEL_HANDLE || '1d11c1d62a7e589153f10512d09710fe';
    var iamPrefix = 'user/garrettwong@gwongcloud.com';
    var permissions = ['iam.serviceAccounts.actAs'];

    console.log(forsetiServerVmIpAddress, forsetiModelId, iamPrefix)

    // ref: https://grpc.io/docs/tutorials/basic/node/
    // iamPrefix='user/garrettwong@gwongcloud.com';

    var explainClient = getGrpcClient(protoPath, forsetiServerVmIpAddress)
    console.log(explainClient)

    var meta = new grpc.Metadata()
    meta.add('handle', forsetiModelId)

    let response = explainClient.getAccessByMembers({
        member_name: iamPrefix,
        // permission_names: permissions,
        expand_resources: true
    }, meta)

    var results = []
    response.on('data', function (res) {
        console.log('result:', res);
        results.push(res);
    })

    response.on('end', function () {
        console.log('end of stream.  final results:', results);
    })
}


getIamExplainResources();
// getExplainClientMethods()
