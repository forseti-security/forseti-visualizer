// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* crypto-service */
class CryptoService {
    constructor(
        projectId = 'forseti-security-new',
        keyRingId = 'test',
        cryptoKeyId = 'quickstart') {

        this.projectId = projectId;
        this.keyRingId = keyRingId;
        this.cryptoKeyId = cryptoKeyId;
    }

    async encrypt(
        plaintextFileName = '/Users/garrettwong/Git/forseti-visualizer/forseti-api/dockersource.env',
        ciphertextFileName = 'dockersource.env.enc'
    ) {
        const fs = require('fs');
        const {
            promisify
        } = require('util');

        // Import the library and create a client
        const kms = require('@google-cloud/kms');
        const client = new kms.KeyManagementServiceClient();

        // The location of the crypto key's key ring, e.g. "global"
        const locationId = 'global';

        // Reads the file to be encrypted
        const readFile = promisify(fs.readFile);
        const contentsBuffer = await readFile(plaintextFileName);
        console.log(contentsBuffer);

        const plaintext = contentsBuffer.toString('base64');

        console.log(plaintext);

        const name = client.cryptoKeyPath(
            this.projectId,
            locationId,
            this.keyRingId,
            this.cryptoKeyId
        );

        // Encrypts the file using the specified crypto key
        const [result] = await client.encrypt({
            name,
            plaintext
        });
        const writeFile = promisify(fs.writeFile);
        await writeFile(ciphertextFileName, Buffer.from(result.ciphertext, 'base64'));
        console.log(`Encrypted ${plaintextFileName} using ${result.name}.`);
        console.log(`Result saved to ${ciphertextFileName}.`);

        return Buffer.from(result.ciphertext, 'base64');
    }

    async decrypt(
        ciphertextFileName = 'dockersource.env.enc',
        plaintextFileName = 'dockersource.env.decrypted'
    ) {
        const fs = require('fs');
        const {
            promisify
        } = require('util');

        // Import the library and create a client
        const kms = require('@google-cloud/kms');
        const client = new kms.KeyManagementServiceClient();

        // The location of the crypto key's key ring, e.g. "global"
        const locationId = 'global';

        // Reads the file to be decrypted
        const readFile = promisify(fs.readFile);
        const contentsBuffer = await readFile(ciphertextFileName);
        const name = client.cryptoKeyPath(
            this.projectId,
            locationId,
            this.keyRingId,
            this.cryptoKeyId
        );
        const ciphertext = contentsBuffer.toString('base64');

        // Decrypts the file using the specified crypto key
        const [result] = await client.decrypt({
            name,
            ciphertext
        });

        // Writes the decrypted file to disk
        const writeFile = promisify(fs.writeFile);
        await writeFile(plaintextFileName, Buffer.from(result.plaintext, 'base64'));
        console.log(
            `Decrypted ${ciphertextFileName}, result saved to ${plaintextFileName}.`
        );

        console.log(Buffer.from(result.plaintext, 'base64').toString('utf8'));

        return Buffer.from(result.plaintext, 'base64').toString('utf8');
    }

}

export default new CryptoService();