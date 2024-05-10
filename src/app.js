document.getElementById("encBtn").addEventListener("click", function() {
    selected = document.getElementById("selectID").value;
    plaintext = document.getElementById("text1").value;
    if (selected == "0") {
    }
    else{
    }
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