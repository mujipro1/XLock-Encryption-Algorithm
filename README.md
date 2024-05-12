# XLock-Encryption-Algorithm
 AES based encryption algorithm with slight changes


## Overview

This encryption algorithm is designed to encrypt and decrypt text using a series of rounds and a specified key. It employs several cryptographic techniques including substitution, bitwise operations, mix columns, and key generation.

## Features

- Encrypts and decrypts text using a specified key
- Supports customizable number of encryption rounds
- Utilizes mix columns operation for enhanced security

## Usage

### Installation

No installation is required. Simply include the provided JavaScript code in your project.

### Encryption

To encrypt text, use the `encrypt(text, key, rounds)` function. Provide the text to be encrypted, the encryption key, and the number of rounds.

```javascript
const KEY = "Great";
const text = "HELLOIAMGOODATIT";
const rounds = 3;

let encryptedText = encrypt(text, KEY, rounds);
console.log("Encrypted:", encryptedText);
```

### Decryption

To decrypt encrypted text, use the `decrypt(encryptedText, key, rounds)` function. Provide the encrypted text, the decryption key, and the number of rounds.

```javascript
const encryptedText = "SOMEENCRYPTEDTEXT";
const KEY = "Great";
const rounds = 3;

let decryptedText = decrypt(encryptedText, KEY, rounds);
console.log("Decrypted:", decryptedText);
```

## Example

```javascript
const KEY = "Great";
const text = "HELLOIAMGOODATIT";
const rounds = 3;

let keys = keyGenerator(KEY, rounds);
let encryptedText = encrypt(text, keys, rounds);
console.log("Encrypted:", encryptedText);

let decryptedText = decrypt(encryptedText, keys, rounds);
console.log("Decrypted:", decryptedText);
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
