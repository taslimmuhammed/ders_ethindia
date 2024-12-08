// web3utils.js
import { keccak256 } from 'js-sha3';

export const Web3Utils = {
    parseABI: function (abi) {
        const functions = {};

        for (const item of abi) {
            if (item.type === 'function') {
                const inputs = item.inputs.map(input => input.type).join(',');
                const signature = `${item.name}(${inputs})`;

                functions[item.name] = {
                    signature,
                    inputs: item.inputs,
                    outputs: item.outputs,
                    stateMutability: item.stateMutability
                };
            }
        }

        return functions;
    },

    encodeParameter: function (type, value) {
        const result = new Uint8Array(32);

        if (type === 'address') {
            const cleanValue = value.replace('0x', '').padStart(64, '0');
            for (let i = 0; i < 32; i++) {
                result[i] = parseInt(cleanValue.substr(i * 2, 2), 16);
            }
        }
        else if (type.startsWith('uint')) {
            const bigIntValue = BigInt(value);
            const hexValue = bigIntValue.toString(16).padStart(64, '0');
            for (let i = 0; i < 32; i++) {
                result[i] = parseInt(hexValue.substr(i * 2, 2), 16);
            }
        }
        else if (type === 'bool') {
            result[31] = value ? 1 : 0;
        }
        else if (type === 'string' || type === 'bytes') {
            const encoder = new TextEncoder();
            const encoded = encoder.encode(value);
            const length = encoded.length;

            const offsetArray = new Uint8Array(32);
            offsetArray[31] = 32;

            const lengthArray = new Uint8Array(32);
            lengthArray[31] = length;

            const paddedLength = Math.ceil(length / 32) * 32;
            const dataArray = new Uint8Array(paddedLength);
            dataArray.set(encoded);

            return {
                isDynamic: true,
                data: Buffer.from(Buffer.concat([
                    Buffer.from(offsetArray),
                    Buffer.from(lengthArray),
                    Buffer.from(dataArray)
                ]))
            };
        }

        return {
            isDynamic: false,
            data: result
        };
    },

    encodeFunctionSignature: function (functionSignature) {
        const hash = keccak256(functionSignature);
        const result = new Uint8Array(4);
        for (let i = 0; i < 4; i++) {
            result[i] = parseInt(hash.substr(i * 2, 2), 16);
        }
        return result;
    },

    encodeFunctionData: function (functions, functionName, args) {
        const functionDef = functions[functionName];
        if (!functionDef) {
            throw new Error(`Function ${functionName} not found in ABI`);
        }

        const selector = this.encodeFunctionSignature(functionDef.signature);

        const staticArgs = [];
        const dynamicArgs = [];

        if (args.length !== functionDef.inputs.length) {
            throw new Error(`Expected ${functionDef.inputs.length} arguments, got ${args.length}`);
        }

        functionDef.inputs.forEach((input, index) => {
            const encoded = this.encodeParameter(input.type, args[index]);

            if (encoded.isDynamic) {
                staticArgs.push(encoded.offsetPointer);
                dynamicArgs.push(encoded.data);
            } else {
                staticArgs.push(encoded.data);
            }
        });

        const encodedArgs = Buffer.concat([
            ...staticArgs.map(arg => Buffer.from(arg)),
            ...dynamicArgs
        ]);

        const result = Buffer.concat([
            Buffer.from(selector),
            encodedArgs
        ]);

        return '0x' + result.toString('hex');
    }
};