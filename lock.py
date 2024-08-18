def encrypt(message, key, i):
    if len(message) != 16 or len(key) != 16:
        raise ValueError("Message and key must be 16 characters long.")

    message_blocks = [message[i:i+4] for i in range(0, 16, 4)]
    key_blocks = [key[i:i+4] for i in range(0, 16, 4)]

    for i in range(4):
        key_blocks[i] = ''.join(chr(ord(a) ^ ord(b)) for a, b in zip(key_blocks[i], message_blocks[i]))

    for i in range(4):
        message_blocks[i], key_blocks[i] = key_blocks[i], message_blocks[i ^ 1]

    for i in range(4):
        key_blocks[i] = ''.join(chr(ord(a) ^ ord(b)) for a, b in zip(key_blocks[i], message_blocks[i]))
    for i in range(4):
        message_blocks[i], key_blocks[i] = key_blocks[i], message_blocks[i ^ 1]

    encrypted_message = ''.join(message_blocks)
    return encrypted_message

def decrypt(encrypted_message, key, i):
    if len(encrypted_message) != 16 or len(key) != 16:
        raise ValueError("Encrypted message and key must be 16 characters long.")

    encrypted_blocks = [encrypted_message[i:i+4] for i in range(0, 16, 4)]
    key_blocks = [key[i:i+4] for i in range(0, 16, 4)]

    # Fourth round: Reverse the process
    for i in range(4):
        encrypted_blocks[i], key_blocks[i] = key_blocks[i], encrypted_blocks[i ^ 1]
    for i in range(4):
        key_blocks[i] = ''.join(chr(ord(a) ^ ord(b)) for a, b in zip(key_blocks[i], encrypted_blocks[i]))
    for i in range(4):
        encrypted_blocks[i], key_blocks[i] = key_blocks[i], encrypted_blocks[i ^ 1]
    for i in range(4):
        key_blocks[i] = ''.join(chr(ord(a) ^ ord(b)) for a, b in zip(key_blocks[i], encrypted_blocks[i]))

    # Concatenate blocks to form the decrypted message
    decrypted_message = ''.join(encrypted_blocks)
    return decrypted_message















def encrypt(string, key):
    return string
def decrypt(string, key):
    return string