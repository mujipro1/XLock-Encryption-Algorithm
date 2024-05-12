import time 

def key_generator(input_string, rounds):
    """Generates keys for each round of encryption/decryption."""
    def letters_to_binary(input_string):
        """Converts a string to binary representation."""
        binary_string = ""
        for char in input_string:
            ascii_value = ord(char)
            binary_string += format(ascii_value, '08b')
        return int(binary_string, 2)

    def bitwise_shift_key_generation(original_key):
        """Generates keys by bitwise shifting the original key."""
        keys = [original_key]
        current_key = original_key
        for _ in range(127):
            current_key = current_key >> 1
            current_key = current_key & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
            if current_key not in keys:
                keys.append(current_key)
        
        current_key = original_key
        for _ in range(127):
            current_key = current_key << 1
            current_key = current_key & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
            if current_key not in keys:
                keys.append(current_key)

        return [format(key, '0128b') for key in keys]

    original_key = letters_to_binary(input_string)
    generated_keys = bitwise_shift_key_generation(original_key)
    generated_keys = [int(key, 2) for key in generated_keys ]
    
    string = ""
    for i in range(len(generated_keys)):
        string += str(generated_keys[i])

    generated_keys = []
    for i in range(0, len(string), 16):
        generated_keys.append((string[i:i+16]))
    generated_keys = generated_keys[:-1]
    
    generated_keys = generated_keys[::-1]
    for i in range(len(generated_keys)):
        generated_keys[i] = generated_keys[i][::-1]

    if len(generated_keys) < rounds:
        for i in range(rounds - len(generated_keys)):
            generated_keys.append(generated_keys[i])
                                
    return generated_keys

def per_round_keys(keys, i, rounds):
    """Returns the keys for each round."""
    return keys[i*rounds:rounds+(i*rounds)]

def pad(string):
    """Pads the string to make it a multiple of 16 bytes."""
    length = str(len(string))
    while len(length) < 8:
        length = '0' + length
    while (len(string) % 16) - 8 != 0:
        string += '0'
    string += length
    return string


def mix_columns(s):
    """Mix the four bytes in each column in a block."""
    def xtime(a):
        """Multiply on GF(2^8)."""
        return ((a << 1) ^ 0x1B) if (a & 0x80) else (a << 1)
    
    s = [s[i:i+4] for i in range(0, len(s), 4)]    
    s = [[int(hex(b), 16) for b in row] for row in s]
    
    for i in range(4):
        t = s[0][i] ^ s[1][i] ^ s[2][i] ^ s[3][i]
        u = s[0][i]
        s[0][i] ^= t ^ xtime(s[0][i] ^ s[1][i])
        s[1][i] ^= t ^ xtime(s[1][i] ^ s[2][i])
        s[2][i] ^= t ^ xtime(s[2][i] ^ s[3][i])
        s[3][i] ^= t ^ xtime(s[3][i] ^ u)
    
    return [b for a in s for b in a]


def inv_mix_columns(s):
    """Inverse MixColumns function."""
    def xtime(a):
        """Multiply on GF(2^8)."""
        return ((a << 1) ^ 0x1B) if (a & 0x80) else (a << 1)

    s = [s[i:i+4] for i in range(0, len(s), 4)]
    s = [[int(hex(b), 16) for b in row] for row in s]

    for i in range(4):
        u = xtime(xtime(s[0][i] ^ s[2][i]))
        v = xtime(xtime(s[1][i] ^ s[3][i]))
        s[0][i] ^= u
        s[1][i] ^= v
        s[2][i] ^= u
        s[3][i] ^= v
    s = [b for a in s for b in a]
    return mix_columns(s)

    
def encrypt_block(text, key):
    """Encrypts a block of text."""
    output = []
    
    # substitution with key
    for i in range(len(text)):
        number = ord(text[i].upper()) - 65
        shift = int(key[i])
        output.append((number+shift) % 26)

    # couple swapping
    for i in range(0, len(output)-1, 2):
        temp = output[i]
        output[i] = output[i+1]
        output[i+1] = temp

    # mix columns operation
    output = mix_columns(output)
    
    
    # cumulative addition
    for i in range(len(output)-1):
        output[i+1] = (output[i] + output[i+1]) % 26
    
    return "".join([chr(65 + i) for i in output])


def decrypt_block(text, key):
    """Decrypts a block of text."""
    output = []
    for i in text:
        output.append(ord(i) - 65)
    out2 = output.copy()
    
    # cumulative subtraction
    out2 = [output[0]]  # Initialize out2 with the first element of output
    for i in range(len(output)-1):
        out2.append((26 + output[i+1] - output[i]) % 26)
    output = out2

    # inverse mix columns operation
    output = inv_mix_columns(output)
    
    # couple swapping
    for i in range(0, len(output)-1, 2):
        temp = output[i]
        output[i] = output[i+1]
        output[i+1] = temp
    
    # substitution with key
    text = []
    for i in range(len(output)):
        number = output[i]
        shift = int(key[i])
        text.append(chr(65 + (number-shift) % 26))

    return "".join(text)


def encrypt(text, key, rounds):
    """Encrypts the text using the key and rounds."""
    text = "".join([i for i in text if i.isalpha()]).upper()
    for i in range(rounds):
        round_key = key[i]
        text = encrypt_block(text, round_key)
    return text

def decrypt(encrypted_text, key, rounds):
    """Decrypts the text using the key and rounds."""
    for i in range(rounds-1, -1, -1):
        round_key = key[i]
        encrypted_text = decrypt_block(encrypted_text, round_key)
    return encrypted_text


KEY = "Great"
string = "HELLOIAMGOODATIT"
rounds = 1

keys = key_generator(KEY, rounds)
start = time.time()

string = pad(string)
strings = [string[i:i+16] for i in range(0, len(string), 16)]
outputs = []

for i in range(len(strings) - 1):
    keysx = per_round_keys(keys, i, rounds)
    encrypted = encrypt(strings[i], keysx, rounds)
    outputs.append(encrypted)

print("Encrypted:", outputs)

decrypts = []
for i in range(len(strings) - 1):
    decrypted = decrypt(outputs[i], keysx, rounds)
    decrypts.append(decrypted)    
print("Decrypted:", decrypts)

print("Time taken:", time.time() - start)
