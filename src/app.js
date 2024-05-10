document.getElementById("encBtn").addEventListener("click", function() {
    const selected = document.getElementById("selectID").value;
    const text = document.getElementById("text1").value;
    const key = document.getElementById("key").value;

    if (key == "" || key == null || key == undefined) {
        displayError("Key is required!");
        return;
    }
    if (/\d/.test(key)) {
        displayError("Key should not contain numbers!");
        return;
    }
    if (text == "") {
        displayError("Text is required!");
        return;
    }

    if (selected == "0") {
        encrypted = encrypt(text, key);
    }
    else{
        decrypted = decrypt(text, key);
    }
    document.getElementById("text2").value = selected == "0" ? encrypted : decrypted;
});


document.getElementById("selectID").addEventListener("change", function() {
    selected = document.getElementById("selectID").value;
    button = document.getElementById("encBtn");
    text1 = document.getElementById("text1");
    text2 = document.getElementById("text2");
    if (selected == "0") {
        button.innerText = "Encrypt";
        text1.placeholder = "Enter plain text";
        text2.placeholder = "Cipher text";
    }else{
        button.innerText = "Decrypt";
        text1.placeholder = "Enter cipher text";
        text2.placeholder = "Plain text";
    }
});


function displayError(text){
    document.getElementById('error').innerText = text;
    document.getElementById('errorbox').classList.add('show');
    document.getElementById('errorbox').classList.remove('hide');
    
    setTimeout(function() {
        document.getElementById('errorbox').classList.add('hide');
        document.getElementById('errorbox').classList.remove('show');
    }, 3000);
    return;
}