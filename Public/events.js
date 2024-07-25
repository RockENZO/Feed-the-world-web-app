var AllEvents = [];

document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();

    // Existing code to fetch and display branches...
});

function checkLoginStatus() {
    fetch('/check-login')
        .then(response => response.json())
        .then(data => {
            if (!data.isLoggedIn) {
                alert('You need to be logged in to view this page.');
                window.location.href = '/signin'; // Redirect them to the login page
            }
        })
        .catch(error => console.error('Error checking login status:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    var filterButton = document.getElementById('filterEvents');

    if (filterButton) {
        filterButton.addEventListener('click', filter_events);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var submitButton = document.getElementById('manager-create-event');

    if (submitButton) {
        submitButton.addEventListener('click', create_event);
    }
});

function load_events() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            AllEvents = JSON.parse(this.responseText);

            if (AllEvents.length > 0) {
                get_rsvp_status();

                for (var i = 0; i < AllEvents.length; i++) {
                    AllEvents[i].timestamp = new Date(AllEvents[i].timestamp).toLocaleString();
                    AllEvents[i].rsvp = false;
                }
            }
        }
    };

    xhttp.open("GET", "/events/getEvents", true);
    xhttp.send();
}

function get_rsvp_status() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let rsvpdEvents = JSON.parse(this.responseText);

            if (rsvpdEvents.length > 0 && AllEvents.length > 0) {
                for (var i = 0; i < rsvpdEvents.length; i++) {
                    let thisEvent = rsvpdEvents[i].event_id - 1; // Ids start from 1, whereas arrays start at 0.
                    AllEvents[thisEvent].rsvp = true;
                }
            }

            load_branches();
            display_events();
        }
    };

    xhttp.open("GET", "/events/getRsvp", true);
    xhttp.send();
}

function create_event() {
    var xhttp = new XMLHttpRequest();

    let newTitle = document.getElementById(`manager-title`).value;
    let newContent = document.getElementById(`manager-content`).value;
    let newBranch = document.getElementById(`manager-branch`).value;

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            load_events();
        }
    };

    xhttp.open("POST", "/events/addEvent", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({
        title: newTitle,
        content: newContent,
        branch: newBranch
    }));
}

function array_contains(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === value) {
            return true;
        }
    }

    return false;
}

function event_rsvp(button, index) {
    button.disabled = true;
    AllEvents[index].rsvp = true;

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            AllEvents[index].rsvp = true;
            filter_events();
        }
    };

    xhttp.open("POST", "/events/setRsvp", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({
        eventId: index + 1
    }));
}

function load_branches() {
    let branches = document.getElementById("branch");
    let allBranches = [];

    // Delete bracnhes for refresh.
    while (branches.children.length > 1) {
        branches.removeChild(branches.lastChild);
    }

    // Load options.
    for (var i = 0; i < AllEvents.length; i++) {
        if (!array_contains(allBranches, AllEvents[i].branch)) {
            allBranches.push(AllEvents[i].branch);

            let newOption = document.createElement("option");
            newOption.innerText = AllEvents[i].branch;
            branches.appendChild(newOption);
        }
    }
}

function display_events() {
    // Delete all children.
    var eventsContainer = document.getElementById("events-container");
    while (eventsContainer.children.length > 0) {
        eventsContainer.removeChild(eventsContainer.firstChild);
    }

    // Add back in.
    for (let i = 0; i < AllEvents.length; i++) {
        var heading = document.createElement("h2");
        heading.innerText = AllEvents[i].title;
        heading.className = "event";

        var button = document.createElement("button");
        button.addEventListener('click', function () { event_rsvp(this, i); });
        button.disabled = AllEvents[i].rsvp;
        button.type = "button";
        button.innerText = "RSVP";

        var branch = document.createElement("p");
        branch.className = "events-branch";
        branch.innerText = AllEvents[i].branch;

        var content = document.createElement("p");
        content.innerText = AllEvents[i].content;

        var timestamp = document.createElement("p");
        timestamp.className = "events-date";
        timestamp.innerText = AllEvents[i].timestamp;

        var thisDiv = document.createElement("div");
        thisDiv.className = "events-item";

        thisDiv.appendChild(heading);
        thisDiv.appendChild(button);
        thisDiv.appendChild(branch);
        thisDiv.appendChild(document.createElement("hr"));
        thisDiv.appendChild(content);
        thisDiv.appendChild(document.createElement("br"));
        thisDiv.appendChild(timestamp);

        eventsContainer.appendChild(thisDiv);
    }

    filter_events();
}

function filter_events() {
    var eventsContainer = document.getElementById("events-container");

    var branchFilterElement = document.getElementById("branch");
    var branchFilterText = branchFilterElement.options[branchFilterElement.selectedIndex].text;
    var rsvpElement = document.getElementById("all-events");

    for (var i = 0; i < eventsContainer.childElementCount; i++) {
        eventsContainer.children[i].style.display = 'inline';

        // Branch
        if (branchFilterText !== "") {
            if (AllEvents[i].branch !== branchFilterText) {
                eventsContainer.children[i].style.display = 'none';
            }
        }

        // RSVP
        if (!rsvpElement.checked) {
            if (AllEvents[i].rsvp === true) {
                eventsContainer.children[i].style.display = 'none';
            }
        }
    }
}

function load_role() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (JSON.parse(this.responseText).role !== `Manager`) {
                document.getElementById(`manager`).style.display = `none`;
            } else {
                display_rsvped();
            }
        }
    };

    xhttp.open("GET", "/events/userRole", true);
    xhttp.send();
}

function load_manager_branches() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var unformattedBranches = JSON.parse(this.responseText);
            var displayBranches = [];

            if (document.getElementById(`manager`).style.display !== `none`) {
                var managerBranch = document.getElementById(`manager-branch`);

                while (managerBranch.children.length > 0) {
                    managerBranch.removeChild(managerBranch.lastChild);
                }

                for (var i = 0; i < unformattedBranches.length; i++) {
                    if (!array_contains(displayBranches, unformattedBranches[i].branch)) {
                        displayBranches.push(unformattedBranches[i].branch);

                        let newOption = document.createElement("option");
                        newOption.innerText = unformattedBranches[i].branch;
                        managerBranch.appendChild(newOption);
                    }
                }
            }
        }
    };

    xhttp.open("GET", "/events/getBranches", true);
    xhttp.send();
}

function display_rsvped() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let rsvpdUsers = JSON.parse(this.responseText);
            let tableObject = document.getElementById(`manager-table`);

            for (var i = 0; i < rsvpdUsers.length; i++) {
                var newRow = document.createElement(`tr`);
                var newName = document.createElement(`td`);
                var newEvent = document.createElement(`td`);

                newName.innerText = rsvpdUsers[i].username;
                newEvent.innerText = rsvpdUsers[i].title;

                newRow.appendChild(newName);
                newRow.appendChild(newEvent);

                tableObject.appendChild(newRow);
            }
        }
    };

    xhttp.open("GET", "/events/rsvpUsers", true);
    xhttp.send();
}

load_role();
load_manager_branches();
document.addEventListener("DOMContentLoaded", load_events);