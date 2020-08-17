
window.addEventListener("load", init);

function init(){
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', submitLogin)
}

function submitLogin(event) {
    event.preventDefault(); 

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let rememberMe = document.getElementById('rememberMe').checked;
    
    let isValidInput = validateUserInput(email, password);
		if(isValidInput) {
            console.log(email + " " + password + " " + password)

			fetch(`http://localhost:5000/login?email=${email}&password=${password}&rememberMe=${rememberMe}`, {
				method: 'post',
			}).then(response => response.text())
			    .then(result => ans=result)
				.then(()=> handleResponse(ans))
				.catch(error => console.log('error', error));
	}   
};

function validateUserInput(email, password) {
    document.getElementById("errors").innerHTML="";

    if(email == 'admin' && password == 'admin') return true;

    let isValidEmail = (/\S+@\S+\.\S+/).test(email)
    if(!isValidEmail) {
        document.getElementById("errors").innerHTML += "<br>Wrong email format";
    }

    let isValidPassword = password.length > 5;
    if(!isValidPassword) {
        document.getElementById("errors").innerHTML += "<br>password must contains at list 6 characters";
    }

        return isValidEmail && isValidPassword;
}
			
function handleResponse(ans) {
	switch(ans) {
		case "NOT_EXISTS":
			document.getElementById('errors').innerHTML = "The details you entered does not match any account. Sign up for the account"
			break;

		case "INCORRECT":
			document.getElementById('errors').innerHTML = "User name or password incorrect"
			break;

		case "OK":
			location.href = "./private/homePage.html";
			break;
    }  
}