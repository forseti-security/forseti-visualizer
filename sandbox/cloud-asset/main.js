const {
    AssetServiceClient
} = require('@google-cloud/asset');
const client = new AssetServiceClient();

async function exportAssets() {
    const projectId = await client.getProjectId();
    console.log(projectId);

    const projectResource = `projects/${projectId}`;

    // TODO(developer): choose the dump file path
    // const dumpFilePath = 'Dump file path, e.g.: gs://<my_bucket>/<my_asset_file>'
    const dumpFilePath = 'gs://devops-shared-vpc-cai/assets.jsonl'

    const request = {
        parent: projectResource,
        outputConfig: {
            gcsDestination: {
                uri: dumpFilePath,
            },
        },
    };

    // Handle the operation using the promise pattern.
    const [operation] = await client.exportAssets(request);

    // Operation#promise starts polling for the completion of the operation.
    const [result] = await operation.promise();

    // Do things with with the response.
    console.log(result);
}
exportAssets();