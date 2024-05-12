function keyGenerator(inputString, rounds) {
    function lettersToBinary(inputString) {
        let binaryString = "";
        for (let char of inputString) {
            let asciiValue = char.charCodeAt(0);
            binaryString += asciiValue.toString(2).padStart(8, '0');
        }
        return parseInt(binaryString, 2);
    }

    function bitwiseShiftKeyGeneration(originalKey) {
        let keys = [originalKey];
        let currentKey = originalKey;
        for (let i = 0; i < 127; i++) {
            currentKey = currentKey >>> 1;
            currentKey = currentKey & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
            if (!keys.includes(currentKey)) {
                keys.push(currentKey);
            }
        }
        
        currentKey = originalKey;
        for (let i = 0; i < 127; i++) {
            currentKey = currentKey << 1;
            currentKey = currentKey & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
            if (!keys.includes(currentKey)) {
                keys.push(currentKey);
            }
        }

        return keys.map(key => key.toString(2).padStart(128, '0'));
    }

    let originalKey = lettersToBinary(inputString);
    let generatedKeys = bitwiseShiftKeyGeneration(originalKey);
    generatedKeys = generatedKeys.map(key => parseInt(key, 2));

    let string = "";
    for (let i = 0; i < generatedKeys.length; i++) {
        string += generatedKeys[i].toString();
    }

    generatedKeys = [];
    for (let i = 0; i < string.length; i += 16) {
        generatedKeys.push(string.substring(i, i + 16));
    }
    generatedKeys = generatedKeys.slice(0, -1);
    
    generatedKeys = generatedKeys.reverse().map(key => key.split("").reverse().join(""));

    if (generatedKeys.length < rounds) {
        for (let i = 0; i < rounds - generatedKeys.length; i++) {
            generatedKeys.push(generatedKeys[i]);
        }
    }

    return generatedKeys;
}

function perRoundKeys(keys, i, rounds) {
    return keys.slice(i * rounds, rounds + (i * rounds));
}

function pad(string) {
    let length = string.length.toString();
    while (length.length < 8) {
        length = '0' + length;
    }
    while ((string.length % 16) - 8 !== 0) {
        string += '0';
    }
    string += length;
    return string;
}

function mixColumns(s) {
    function xtime(a) {
        return ((a << 1) ^ 0x1B) ^ ((a & 0x80) ? 1 : 0);
    }

    s = s.match(/.{1,4}/g).map(row => row.split("").map(b => parseInt(b, 16)));

    for (let i = 0; i < 4; i++) {
        let t = s[0][i] ^ s[1][i] ^ s[2][i] ^ s[3][i];
        let u = s[0][i];
        s[0][i] ^= t ^ xtime(s[0][i] ^ s[1][i]);
        s[1][i] ^= t ^ xtime(s[1][i] ^ s[2][i]);
        s[2][i] ^= t ^ xtime(s[2][i] ^ s[3][i]);
        s[3][i] ^= t ^ xtime(s[3][i] ^ u);
    }

    return s.flat().map(b => b.toString(16)).join("");
}

function invMixColumns(s) {
    function xtime(a) {
        return ((a << 1) ^ 0x1B) ^ ((a & 0x80) ? 1 : 0);
    }

    s = s.match(/.{1,4}/g).map(row => row.split("").map(b => parseInt(b, 16)));

    for (let i = 0; i < 4; i++) {
        let u = xtime(xtime(s[0][i] ^ s[2][i]));
        let v = xtime(xtime(s[1][i] ^ s[3][i]));
        s[0][i] ^= u;
        s[1][i] ^= v;
        s[2][i] ^= u;
        s[3][i] ^= v;
    }

    s = s.flat().map(b => b.toString(16)).join("");
    return mixColumns(s);
}

function encryptBlock(text, key) {
    let output = [];

    for (let i = 0; i < text.length; i++) {
        let number = text.charCodeAt(i) - 65;
        let shift = parseInt(key[i]);
        output.push((number + shift) % 26);
    }

    for (let i = 0; i < output.length - 1; i += 2) {
        let temp = output[i];
        output[i] = output[i + 1];
        output[i + 1] = temp;
    }

    output = mixColumns(output);

    for (let i = 0; i < output.length - 1; i++) {
        output[i + 1] = (output[i] + output[i + 1]) % 26;
    }

    return output.map(i => String.fromCharCode(65 + i)).join("");
}

function decryptBlock(text, key) {
    let output = [];
    for (let i = 0; i < text.length; i++) {
        output.push(text.charCodeAt(i) - 65);
    }
    let out2 = output.slice();
    
    out2 = [output[0]];
    for (let i = 0; i < output.length - 1; i++) {
        out2.push((26 + output[i + 1] - output[i]) % 26);
    }
    output = out2;

    output = invMixColumns(output);

    for (let i = 0; i < output.length - 1; i += 2) {
        let temp = output[i];
        output[i] = output[i + 1];
        output[i + 1] = temp;
    }

    let decryptedText = [];
    for (let i = 0; i < output.length; i++) {
        let number = output[i];
        let shift = parseInt(key[i]);
        decryptedText.push(String.fromCharCode(65 + (number - shift + 26) % 26));
    }

    return decryptedText.join("");
}

function encrypt(text, key, rounds) {
    text = text.replace(/[^a-zA-Z]/g, "").toUpperCase();
    for (let i = 0; i < rounds; i++) {
        let roundKey = key[i];
        text = encryptBlock(text, roundKey);
    }
    return text;
}

function decrypt(encryptedText, key, rounds) {
    for (let i = rounds - 1; i >= 0; i--) {
        let roundKey = key[i];
        encryptedText = decryptBlock(encryptedText, roundKey);
    }
    return encryptedText;
}

const KEY = "Great";
let string = "HELLOIAMGOODATIT";
const rounds = 1;

let keys = keyGenerator(KEY, rounds);
let start = Date.now();

string = pad(string);
let strings = string.match(/.{1,16}/g);
let outputs = [];

for (let i = 0; i < strings.length - 1; i++) {
    let keysx = perRoundKeys(keys, i, rounds);
    let encrypted = encrypt(strings[i], keysx, rounds);
    outputs.push(encrypted);
}

console.log("Encrypted:", outputs);

let decrypts = [];
for (let i = 0; i < strings.length - 1; i++) {
    let decrypted = decrypt(outputs[i], keysx, rounds);
    decrypts.push(decrypted);
}
console.log("Decrypted:", decrypts);

console.log("Time taken:", (Date.now() - start) / 1000);
