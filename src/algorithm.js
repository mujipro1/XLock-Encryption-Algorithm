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
        let currentKey = BigInt(originalKey);
        for (let i = 0; i < 127; i++) {
            currentKey = currentKey >> BigInt(1);  
            mask = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
            currentKey = (currentKey >> BigInt(0)) & mask;

            if (!keys.includes(currentKey)) {
                keys.push(currentKey);
            }
        }
        
        currentKey = BigInt(originalKey);
        for (let i = 0; i < 127; i++) {
            currentKey = currentKey << BigInt(1);
            mask = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
            currentKey = (currentKey >> BigInt(0)) & mask;

            if (!keys.includes(currentKey)) {
                keys.push(currentKey);
            }
        }

        return keys.map(key => key.toString(2).padStart(128, '0'));
    }

    let originalKey = lettersToBinary(inputString);
    let generatedKeys = bitwiseShiftKeyGeneration(originalKey);
    for (let i = 0; i < generatedKeys.length; i++) {
        // convert to integer without using exponential notation
        generatedKeys[i] = BigInt("0b" + generatedKeys[i]);
        generatedKeys[i] = generatedKeys[i].toString();
    }

    let string = "";
    for (let i = 0; i < generatedKeys.length; i++) {
        string += generatedKeys[i];
    }

    generatedKeys = [];
    for (let i = 0; i < string.length; i += 16) {
        generatedKeys.push(string.substring(i, i + 16));
    }
    generatedKeys = generatedKeys.slice(0, -1);    

    // reverse the array
    generatedKeys = generatedKeys.reverse();
    // reverse each element in the array
    generatedKeys = generatedKeys.map(key => key.split("").reverse().join(""));

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
function invMixColumns(s) {
    function xtime(a) {
        return (a & 0x80) ? ((a << 1) ^ 0x1B) : (a << 1);
    }

    let sArr = [];
    for (let i = 0; i < s.length; i += 4) {
        sArr.push(s.slice(i, i + 4));
    }

    for (let i = 0; i < 4; i++) {
        let u = xtime(xtime(sArr[0][i] ^ sArr[2][i]));
        let v = xtime(xtime(sArr[1][i] ^ sArr[3][i]));
        sArr[0][i] ^= u;
        sArr[1][i] ^= v;
        sArr[2][i] ^= u;
        sArr[3][i] ^= v;
    }

    let sFlat = [];
    for (let a of sArr) {
        for (let b of a) {
            sFlat.push(b);
        }
    }

    return mixColumns(sFlat);
}

function mixColumns(s) {
    function xtime(a) {
        return (a & 0x80) ? ((a << 1) ^ 0x1B) : (a << 1);
    }

    let sArr = [];
    for (let i = 0; i < s.length; i += 4) {
        sArr.push(s.slice(i, i + 4));
    }

    for (let i = 0; i < 4; i++) {
        let t = sArr[0][i] ^ sArr[1][i] ^ sArr[2][i] ^ sArr[3][i];
        let u = sArr[0][i];
        sArr[0][i] ^= t ^ xtime(sArr[0][i] ^ sArr[1][i]);
        sArr[1][i] ^= t ^ xtime(sArr[1][i] ^ sArr[2][i]);
        sArr[2][i] ^= t ^ xtime(sArr[2][i] ^ sArr[3][i]);
        sArr[3][i] ^= t ^ xtime(sArr[3][i] ^ u);
    }

    return [].concat(...sArr);
}

function encryptBlock(text, key) {
    let output = [];
    
    for (let i = 0; i < text.length; i++) {
        let charCode = text[i].toUpperCase().charCodeAt(0) - 65;
        let shift = parseInt(key[i]);
        output.push((charCode + shift) % 26);

    }
    for (let i = 0; i < output.length - 1; i += 2) {
        let temp = output[i];
        output[i] = output[i + 1];
        output[i + 1] = temp;
    }
    
    
    for (let i = 0; i < output.length - 1; i++) {
        output[i + 1] = (output[i] + output[i + 1]) % 26;
    }

    // output = mixColumns(output);
    
    return output.map(i => String.fromCharCode(65 + i)).join("");
}

function decryptBlock(text, key) {
    let output = [];
    for (let i = 0; i < text.length; i++) {
        output.push(text.charCodeAt(i) - 65);
    }

    // output = invMixColumns(output);
    
    let out2 = output.slice();
    
    out2 = [output[0]];
    for (let i = 0; i < output.length - 1; i++) {
        out2.push((26 + output[i + 1] - output[i]) % 26);
    }
    output = out2;


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

rounds = 1;

function encrypt_string(string, KEY){
    // string = string.replace(/[^a-zA-Z]/g, "").toUpperCase();

    let keys = keyGenerator(KEY, rounds);

    string = pad(string);
    let strings = string.match(/.{1,16}/g);
    let outputs = [];
    
    for (let i = 0; i < strings.length-1; i++) {
        let keysx = perRoundKeys(keys, i, rounds);
        let encrypted = encrypt(strings[i], keysx, rounds);
        console.log(encrypted);
        outputs.push(encrypted);
    }
    return outputs.join("");
}


function decrypt_string(encrypted, KEY){
    
    let keys = keyGenerator(KEY, rounds);
    let strings = encrypted.match(/.{1,16}/g);
    let decrypts = [];
    for (let i = 0; i < strings.length ; i++) {
        let keysx = perRoundKeys(keys, i, rounds);
        let decrypted = decrypt(strings[i], keysx, rounds);
        decrypts.push(decrypted);
    }
    return decrypts.join("");
}
