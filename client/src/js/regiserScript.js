window.addEventListener("load", init);

function init(){
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', submitRegister)
}

function submitRegister(event) {
    event.preventDefault(); 

    let email = document.getElementById('email').value;
    let fullname = document.getElementById('fullname').value;
    let password = document.getElementById('password').value;

    let isValidInput = validateUserInput(email, fullname , password);
    if(isValidInput) {
        fetch(`http://localhost:5000/register?email=${email}&fullname=${fullname}&password=${password}`, {
        method: 'post',
    }) .then(response => response.text())
        .then(result => ans=result)
        .then(()=> console.log(ans))
        .catch(error => console.log('error', error));
    }
};

function validateUserInput(email, fullname, password) {
    document.getElementById("errors").innerHTML = "";

    let isValidName = (/^[a-zA-Z]+ [a-zA-Z]+$/).test(fullname)
    if(!isValidName) {
        document.getElementById("errors").innerHTML += "<br>Please enter your full name";
    }

    let isValidEmail = (/\S+@\S+\.\S+/).test(email)
    if(!isValidEmail) {
        document.getElementById("errors").innerHTML += "<br>Wrong email format";
    }

    let isValidPassword = password.length > 5;
    if(!isValidPassword){
        document.getElementById("errors").innerHTML += "<br>password must contains at list 6 characters";
    }

    return isValidEmail && isValidPassword;
}