//This function populates the selection of where the post should be viewed
function getBranchNames() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            const obj = JSON.parse(this.responseText);
            const getLength = obj.length;
            var el = document.getElementById("branchSelector");

            for (var i = 1; i <= getLength; i++){
                var opt = document.createElement('option');
                opt.value = i;
                opt.innerHTML = obj[i-1].branch;
                el.appendChild(opt);
            }
        }
    };
    xhttp.open("GET", "/posts/getBranches", true);
    xhttp.send();
}

//this function ensures that a logged in user is a manager
//so that the postBox div can be displayed and then call
//getBranchNames() to populate the content properly.
function showLoggedIn() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const loginData = JSON.parse(this.responseText);
            const boolLoggedIn = loginData.isLoggedIn;
            const checkRole = loginData.role;
            if (boolLoggedIn) {
                if (checkRole == 'Manager') {
                    document.getElementById("loggedInContent").style.display = 'inline';
                    getBranchNames();
                }
            }
        }
    };
    xhttp.open("GET", "/check-login", true);
    xhttp.send();
}



function populatePosts() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var posts = JSON.parse(this.responseText);
            //use this now to first get username from user_id

            //then add username to first part of list

            //then get post_content and add under user name
            console.log(posts);
            //do this for all posts in posts

            //figure out how to append only new posts ............counter?
            }
        };


    xhttp.open("GET", "/posts/getPosts", true);
    xhttp.send();}


//This function will post the post content to the database and collect the
//required information based on who made the post and the branch that it should be
//attributed to
function addPost() {

    var xhttp = new XMLHttpRequest();

    // post content for json send
    const post_content = document.getElementById('postText').value;

    // branchid for json send
    const e = document.getElementById('branchSelector');
    const branchName = e.options[e.selectedIndex].text;
    if (branchName === "Make a Selection"){
        alert('Please make a selection as to how your post will be viewed');
    } else {
        // Fetch the branch ID based on the branch name
        fetch('/posts/getBranchId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: branchName })
        })
        .then(response => response.json())
        .then(data => {
            const branch_id = data[0].branch_id;

            const user_id = 1; // Ideally, get this value dynamically

            // Now that we have the branch_id, proceed with the xhttp request
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    console.log("Post added successfully");
                    // Optionally, refresh the posts or provide feedback to the user
                    populatePosts();
                } else {
                    console.error("Error adding post:", this.responseText);
                }
            };

            xhttp.open("POST", "/posts/addPost", true);
            xhttp.setRequestHeader("Content-Type", "application/json");

            var dataTable = JSON.stringify({ content: post_content, branch: branch_id, user: user_id });
            xhttp.send(dataTable);
        })
        .catch(error => {
            console.error('Error fetching branch ID:', error);
        });
    }
}


// Define function to handle onclick
document.addEventListener("DOMContentLoaded", function() {
    var el = document.getElementById("post_button");
    if (el) {
        if (el.addEventListener) {
            el.addEventListener("click", addPost, false);
        } else if (el.attachEvent) {
            el.attachEvent("onclick", addPost);
        }
    }
    // Load posts after DOM is fully loaded
    showLoggedIn();
    populatePosts();

});