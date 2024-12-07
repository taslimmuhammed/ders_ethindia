export const Web3Utils = {
    // Encode function signature to get first 4 bytes of keccak256 hash
    encodeFunctionSignature: function (functionName) {
        // Convert string to bytes
        const encoder = new TextEncoder();
        const data = encoder.encode(functionName);

        // Calculate keccak256 hash
        const hashArray = new Uint8Array(32);
        keccak256(data, hashArray);

        // Take first 4 bytes
        return hashArray.slice(0, 4);
    },

    // Pad number to 32 bytes
    pad32: function (value) {
        const result = new Uint8Array(32);

        if (typeof value === 'number' || typeof value === 'bigint') {
            const hexValue = value.toString(16).padStart(64, '0');
            for (let i = 0; i < 32; i++) {
                result[i] = parseInt(hexValue.substr(i * 2, 2), 16);
            }
        } else if (typeof value === 'string') {
            if (value.startsWith('0x')) {
                value = value.slice(2);
            }
            value = value.padStart(64, '0');
            for (let i = 0; i < 32; i++) {
                result[i] = parseInt(value.substr(i * 2, 2), 16);
            }
        }

        return result;
    },

    // Encode function call with arguments
    encodeFunctionCall: function (functionSignature, args) {
        // Get function selector (first 4 bytes of keccak hash)
        const selector = this.encodeFunctionSignature(functionSignature);

        // Calculate total length - 4 bytes for selector + 32 bytes for each argument
        const totalLength = 4 + (args.length * 32);
        const encoded = new Uint8Array(totalLength);

        // Add selector
        encoded.set(selector, 0);

        // Add encoded arguments
        args.forEach((arg, index) => {
            const paddedArg = this.pad32(arg);
            encoded.set(paddedArg, 4 + (index * 32));
        });

        return '0x' + Buffer.from(encoded).toString('hex');
    }
};

// Keccak256 implementation
function keccak256(input, output) {
    // Note: This is a placeholder for actual keccak256 implementation
    // You would need to use a library like js-sha3 or implement keccak256
    // For example with js-sha3:
    // const SHA3 = require('js-sha3').keccak256;
    // const hash = SHA3(input);
    // output.set(Buffer.from(hash, 'hex'));
}