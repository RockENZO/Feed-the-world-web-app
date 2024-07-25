function toggleNav() {
    var sidebar = document.getElementById("mySidebar");
    var mainContent = document.getElementById("main");

    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
        mainContent.style.marginLeft = "0";
    } else {
        sidebar.style.width = "250px";
        mainContent.style.marginLeft = "250px";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var toggleBtn = document.querySelector('.openbtn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleNav);
    }
});


document.addEventListener('DOMContentLoaded', function() {
        fetch('/check-login')
            .then(response => response.json())
            .then(data => {
                const linkContainer = document.getElementById('userLink');
                if (data.isLoggedIn) {
                    linkContainer.innerHTML = `<p>Hello, ${data.username}</p><br><a href="/usersettings">Change Details</a>`;
                    if (data.role === 'Admin') {
                        linkContainer.innerHTML += '<a href="/users.html">Manage Users</a>';
                    }
                    linkContainer.innerHTML += '<button type="button" class="logoutBtn">Log Out</button>';
                    document.querySelector('.logoutBtn').addEventListener('click', function() {
                        fetch('/logout', { method: 'POST' })
                            .then(response => response.text())
                            .then(text => {
                                alert(text); // Alert the response
                                window.location.reload(); // Reload the page to update UI
                            })
                            .catch(err => console.error('Logout failed:', err));
                    });
                } else {
                    linkContainer.innerHTML = '<a href="/signin">Sign In</a>';
                }
            })
            .catch(error => console.error('Error:', error));
    });


document.addEventListener('DOMContentLoaded', function() {
    var subscribeLink = document.getElementById('subscribeLink');
    if (subscribeLink) {
        subscribeLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            checkLoginAndSubscribe();
        });
    } else {
        console.error('Subscribe link not found');
    }
});

function checkLoginAndSubscribe() {
    fetch('/check-login')
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                subscribeToNotifications(data.email);
            } else {
                alert('Please log in to subscribe to notifications.');
            }
        })
        .catch(error => console.error('Error checking login status:', error));
}

function subscribeToNotifications(email) {
    fetch('/email/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}`
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error subscribing to notifications:', error));
}
