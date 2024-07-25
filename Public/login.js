document.addEventListener('DOMContentLoaded', function() {
    var loginBtn = document.querySelector('.loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var loginBtn = document.querySelector('.signupBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', signup);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var saveBtn = document.querySelector('.saveBtn');

    if (saveBtn) {
        saveBtn.addEventListener('click', save);
    }
});



function save() {
    let data = {
        username: document.getElementById('update-user').value,
        email: document.getElementById('update-email').value,
        first_name: document.getElementById('update-fname').value,
        last_name: document.getElementById('update-lname').value
    };

    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            alert('Profile updated successfully');
        } else if (req.readyState == 4) {
            alert('Update failed');
        }
    };

    req.open('POST', '/update-user');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(data));
}

function login() {

    let logindata = {
        username: document.getElementById('login-user').value,
        password: document.getElementById('login-pass').value
    };
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            alert('Logged In successfully');
        } else if(req.readyState == 4 && req.status == 401){
            alert('Login FAILED');
        }
    };

    req.open('POST','/login');
    req.setRequestHeader('Content-Type','application/json');
    req.send(JSON.stringify(logindata));
}

function signup() {
    let logindata = {
        username: document.getElementById('signup-user').value,
        password: document.getElementById('signup-pass').value,
        confirm: document.getElementById('signup-confirm').value,
        email: document.getElementById('signup-email').value,
        first_name: document.getElementById('signup-fname').value,
        last_name: document.getElementById('signup-lname').value
    };

    if(document.getElementById('signup-pass').value !== document.getElementById('signup-confirm').value){
        alert("Passwords don't match");
        return;
    }
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            alert('Signed Up successfully');
        } else if(req.readyState == 4 && req.status == 401){
            alert('Signed Up FAILED');
        }
    };
    req.open('POST','/signup');
    req.setRequestHeader('Content-Type','application/json');
    req.send(JSON.stringify(logindata));
}

function logout() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            alert('Logged Out');
        } else if(req.readyState == 4 && req.status == 403){
            alert('Not logged in');
        }
    };
    req.open('POST','/logout');
    req.send();
}

function do_google_login(response){
    // Sends the login token provided by google to the server for verification using an AJAX request
    console.log(response);
    // Setup AJAX request
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        // Handle response from our server
        if(req.readyState == 4 && req.status == 200){
            alert('Logged In with Google successfully');
        } else if(req.readyState == 4 && req.status == 401){
            alert('Login FAILED');
        }
    };
    // Open requst
    req.open('POST','/login');
    req.setRequestHeader('Content-Type','application/json');
    // Send the login token
    req.send(JSON.stringify(response));
}
