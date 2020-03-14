const path = require('path');
// const cwd = path.join(__dirname, '..');
cwd = __dirname;
console.log(cwd);

function main(
    bucketName = 'devops-shared-vpc-cai',
    srcFilename = 'assets.jsonl',
    destFilename = path.join(cwd, 'assets.jsonl')
) {
    // [START storage_download_file]
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const bucketName = 'Name of a bucket, e.g. my-bucket';
    // const srcFilename = 'Remote file to download, e.g. file.txt';
    // const destFilename = 'Local destination for file, e.g. ./local/path/to/file.txt';

    // Imports the Google Cloud client library
    const {
        Storage
    } = require('@google-cloud/storage');

    // Creates a client
    const storage = new Storage({
        keyFilename: "sa-key.json"
    });

    async function convertFileToJson() {
        // read destFilename
        const readline = require('readline');
        const fs = require('fs');
        const readInterface = readline.createInterface({
            input: fs.createReadStream(destFilename),
            crlfDelay: Infinity
        });

        let outputFileName = 'assets.json';
        fs.unlink(outputFileName, (err) => {});
        fs.appendFile(outputFileName, '[', (err) => {
            if (err) throw err;
        });

        let isFirst = true;
        let content = '';
        for await (const line of readInterface) {
            if (isFirst) {
                isFirst = false;
                content += line.replace('\n', '');
            } else {
                content += ',' + line.replace('\n', '');
            }
        }

        await fs.appendFile(outputFileName, content, (err) => {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
        });
        await fs.appendFile(outputFileName, ']', (err) => {
            if (err) throw err;
        });
        // create new file

    }

    async function downloadFile() {
        const options = {
            // The path to which the file should be downloaded, e.g. "./file.txt"
            destination: destFilename,
        };

        // Downloads the file
        await storage
            .bucket(bucketName)
            .file(srcFilename)
            .download(options);

        console.log(
            `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
        );

        await convertFileToJson();
    }

    downloadFile().catch(console.error);
    // [END storage_download_file]
}
main(...process.argv.slice(2));