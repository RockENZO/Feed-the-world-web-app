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

document.addEventListener('DOMContentLoaded', function() {
    fetch('/userbranches')
        .then(response => response.json())
        .then(branches => {
            const container = document.getElementById('branchesContainer');
            branches.forEach(branch => {
                const div = document.createElement('div');
                div.className = 'branch';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'branch-name';
                nameSpan.textContent = branch.name;

                const joinButton = document.createElement('button');
                const leaveButton = document.createElement('button');

                if (branch.is_member) {
                    joinButton.textContent = 'Joined';
                    joinButton.disabled = true;

                    leaveButton.textContent = 'Leave';
                    leaveButton.dataset.branchId = branch.branch_id;
                    leaveButton.addEventListener('click', function() {
                        leaveBranch(branch.branch_id);
                    });
                } else {
                    joinButton.textContent = 'Join';
                    joinButton.dataset.branchId = branch.branch_id;
                    joinButton.addEventListener('click', function() {
                        joinBranch(branch.branch_id);
                    });

                    leaveButton.textContent = 'Leave';
                    leaveButton.disabled = true;
                }

                div.appendChild(nameSpan);
                div.appendChild(joinButton);
                div.appendChild(leaveButton);
                container.appendChild(div);
            });
        })
        .catch(error => console.error('Error fetching branches:', error));
});

function leaveBranch(branchId) {
    fetch(`/userbranches/${branchId}/leave`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                alert('Successfully left the branch!');
                location.reload(); // Optionally reload to update the list
            } else {
                response.text().then(text => alert(text));
            }
        })
        .catch(error => console.error('Error leaving branch:', error));
}
function joinBranch(branchId) {
    fetch(`/userbranches/${branchId}/join`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                alert('Successfully joined the branch!');
                updateBranchesDisplay();  // Refresh the branch display
            } else {
                response.text().then(text => alert(text));
            }
        })
        .catch(error => console.error('Error joining branch:', error));
}

function updateBranchesDisplay() {
    fetch('/userbranches')
        .then(response => response.json())
        .then(branches => {
            const container = document.getElementById('branchesContainer');
            container.innerHTML = '';  // Clear existing branches
            branches.forEach(branch => {
                const div = document.createElement('div');
                div.className = 'branch';
                const button = document.createElement('button');
                button.textContent = 'Join';
                button.dataset.branchId = branch.branch_id;
                button.addEventListener('click', function() {
                    joinBranch(branch.branch_id);
                });
                div.innerHTML = `<strong>${branch.name}</strong>`;
                div.appendChild(button);
                container.appendChild(div);
            });
        })
        .catch(error => console.error('Error fetching branches:', error));
}