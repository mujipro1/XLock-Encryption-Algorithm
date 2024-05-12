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
    current_key = str(bin(original_key))
    binkeylength = len(bin(key)[1:]) // 4

    keys = [int(current_key[i:i+binkeylength], 2) for i in range(0, len(current_key), binkeylength)]    
    keys = keys[:-1]
    
    final_keys = []
    for i in range(len(keys)):
        for _ in range(127):
            keys[i] = keys[i] >> 1
            keys[i] = keys[i] & 0xFFFFFFFF
            if keys[i] not in final_keys:
                final_keys.append(keys[i])
    
key = "HELLOIAMOKAYFINE"
key = letters_to_binary(key)
bitwise_shift_key_generation(key)
