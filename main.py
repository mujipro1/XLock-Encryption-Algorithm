def give_key(key):
    num = []
    for i in key.upper():
        num.append((ord(i) - 65 + len(key)) % 26)
    return sorted(num)

def key_generator(key, i, size):
    key_length = len(key)
    cyclic_pattern = key + key[::-1][1:-1]
    shifted_pattern = cyclic_pattern[i % key_length:] + cyclic_pattern[:i % key_length]
    output = []

    while len(output) < size:
        output.extend(shifted_pattern)

    return output[:size]
    
def encrypt_block(text, key):
    output = []
    for i in range(len(text)):
        number = ord(text[i].upper()) - 65
        shift = key[i]
        output.append((number+shift) % 26)
        
    for i in range(0, len(output)-1, 2):
        temp = output[i]
        output[i] = output[i+1]
        output[i+1] = temp

    sublists = [output[i:i+4] for i in range(0, len(output), 4)]
    
    for i in range(len(sublists)):
        for j in range(len(sublists[i])):
            output[i*4+j] = sublists[j][i]
    
    for i in range(len(output)-1):
        output[i+1] = (output[i] + output[i+1]) % 26
    
    return "".join([chr(65 + i) for i in output])


def decrypt_block(text, key):
    output = []
    for i in text:
        output.append(ord(i) - 65)
        
    out2 = output.copy()
    for i in range(len(output)-1):
        out2[i+1] = (26 + output[i+1] - output[i]) % 26
    output = out2
    
    sublists = [output[i:i+4] for i in range(0, len(output), 4)]
    for i in range(len(sublists)):
        for j in range(len(sublists[i])):
            output[i*4+j] = sublists[j][i]
        
    for i in range(0, len(output)-1, 2):
        temp = output[i]
        output[i] = output[i+1]
        output[i+1] = temp
    
    text = []
    for i in range(len(output)):
        number = output[i]
        shift = key[i]
        text.append(chr(65 + (number-shift) % 26))

    return "".join(text)


def encrypt(text, key, rounds):
    text = "".join([i for i in text if i.isalpha()]).upper()
    encrypted_text = ""
    for i in range(0, len(text), 16):
        block = text[i:i+16]
        for _ in range(rounds):
            keyx = key_generator(key, _, len(block))
            block = encrypt_block(block, keyx) 
        encrypted_text += block
    return encrypted_text

def decrypt(encrypted_text, key, rounds):
    encrypted_text = "".join([i for i in encrypted_text if i.isalpha()])
    decrypted_text = ""
    for i in range(0, len(encrypted_text), 16):
        block = encrypted_text[i:i+16]
        for _ in range(rounds):
            
            keyx = key_generator(key, rounds - _ - 1 , len(block))
            block = decrypt_block(block, keyx)
        decrypted_text += block
    return decrypted_text

text = "HELLOIAMGOODATIT"
key = give_key("GREAT")
rounds = 10

import time 

start = time.time()
encrypted = encrypt(text, key, rounds)
print("Encrypted:", encrypted)
print()

decrypted = decrypt(encrypted, key, rounds)
print("Decrypted:", decrypted)

print("Time taken:", time.time() - start)


import time

def brute_force_attack(plaintext, ciphertext, rounds):
    for i in range(26):
        for j in range(26):
            # for k in range(26):
                for l in range(26):
                    for m in range(26):
                        possible_key = [i, j, l, m]
                        decrypted_text = decrypt(ciphertext, possible_key, rounds)
                        if decrypted_text == plaintext:
                            return possible_key
    return None




# start = time.time()
# found_key = brute_force_attack(text, encrypted, rounds)
# if found_key:
#     for i in range(len(found_key)):
#         found_key[i] = chr(65 + found_key[i] - len(found_key))
#     print("Key found:", found_key)
# else:
#     print("Key not found.")
    
# print("Time taken:", time.time() - start)
