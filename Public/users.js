document.addEventListener('DOMContentLoaded', function() {
    new Vue({
        el: '#app',
        data: {
            authenticated: false,
            username: '',
            password: '',
            newUserName: '',
            newUserRole: 'Normal User',
            branches: [],
            allUsers: [ // Mock data for existing users
                { user_id: 1, name: 'Alice', role: 'Manager', email: 'alice@example.com' },
                { user_id: 2, name: 'Bob', role: 'Normal User', email: 'bob@example.com' },
                { user_id: 3, name: 'Charlie', role: 'Manager', email: 'charlie@example.com' },
                { user_id: 4, name: 'David', role: 'Normal User', email: 'david@example.com' }
            ],
            selectedUser: null,
        },
        mounted() {
            // Fetch branches and users data from the backend
            this.fetchBranches(); // Call a method to fetch branches data
            this.fetchAllUsers(); // Fetch all users when component mounts
        },
        methods: {
            fetchBranches() {
                // Mock data for demonstration
                this.branches = [
                    {   branch_id: 1,
                        name: 'Branch A',
                        users: [
                            { user_id: 1, name: 'Alice', role: 'Manager', email: 'alice@example.com' },
                            { user_id: 2, name: 'Bob', role: 'Normal User', email: 'bob@example.com' }
                        ]
                    },
                    {   branch_id: 2,
                        name: 'Branch B',
                        users: [
                            { user_id: 3, name: 'Charlie', role: 'Manager', email: 'charlie@example.com' },
                            { user_id: 4, name: 'David', role: 'Normal User', email: 'david@example.com' }
                        ]
                    }
                ];
                // Fetch branches and users data from the backend
                var xhr = new XMLHttpRequest();
                xhr.open('GET', '/branches', true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            const branchesData = JSON.parse(xhr.responseText);
                            this.branches = branchesData;
                            console.log('Fetched branches:', branchesData);
                        } else {
                            console.error('Error fetching branches:', xhr.statusText);
                        }
                    }
                }.bind(this);
                xhr.send();
            },

            fetchAllUsers() {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', '/users', true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            const usersData = JSON.parse(xhr.responseText);
                            this.allUsers = usersData;
                        } else {
                            console.error('Error fetching users:', xhr.statusText);
                        }
                    }
                }.bind(this);
                xhr.send();
            },

            addBranch() {
                // Add a new branch with default name and empty user list
                const newBranch = { name: 'New Branch', users: [] };
                this.branches.push(newBranch);
                const branchName = 'New Branch'; // Default branch name
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/branches', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            const createdBranch = JSON.parse(xhr.responseText);
                            newBranch.branch_id = createdBranch.branch_id;
                            console.log('Branch added successfully:', createdBranch);
                        } else {
                            console.error('Error adding branch:', xhr.statusText);
                        }
                    }
                };
                const data = JSON.stringify({ name: branchName });
                xhr.send(data);
            },

            deleteBranch(branchId, index) {
                // Remove the branch at the specified index
                this.branches.splice(index, 1);
                const xhr = new XMLHttpRequest();
                xhr.open('DELETE', `/branches/${branchId}`, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            console.log('Branch deleted successfully');
                        } else {
                            console.error('Error deleting branch:', xhr.statusText);
                        }
                    }
                };
                xhr.send();
            },

            updateUserRole(branch, user) {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', `/users/${user.user_id}`, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            console.log(`Successfully updated role of ${user.name} in ${branch.name} to ${user.role}`);
                        } else {
                            console.error(`Error updating role of ${user.name} in ${branch.name}: ${xhr.statusText}`);
                        }
                    }
                };
                const data = JSON.stringify({ role: user.role });
                xhr.send(data);
            },

            updateUserEmail(branch, user) {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', `/users/${user.user_id}`, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            console.log(`Successfully updated email of ${user.name} in ${branch.name} to ${user.email}`);
                        } else {
                            console.error(`Error updating email of ${user.name} in ${branch.name}: ${xhr.statusText}`);
                        }
                    }
                };
                const data = JSON.stringify({ email: user.email });
                xhr.send(data);
            },

            removeUserFromBranch(branch, user) {
                // Remove user from branch locally
                const index = branch.users.indexOf(user);
                if (index !== -1) {
                    branch.users.splice(index, 1);
                }
                // Send a request to the backend to remove user from branch
                const xhr = new XMLHttpRequest();
                xhr.open('DELETE', `/branches/${branch.branch_id}/users/${user.user_id}`, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            console.log(`Successfully removed ${user.name} from ${branch.name}`);
                        } else {
                            console.error(`Error removing ${user.name} from ${branch.name}: ${xhr.statusText}`);
                        }
                    }
                };
                xhr.send();
            },

            addUserToBranch(branch) {
                if (this.selectedUser) {
                    const newUser = {
                        user_id: this.selectedUser.user_id,
                        name: this.selectedUser.name,
                        role: this.selectedUser.role,
                        email: this.selectedUser.email
                    };
                    branch.users.push(newUser);

                    // Reset the selectedUser to prepare for the next addition
                    this.selectedUser = null;
                    // Send a request to the backend to add the new user to the selected branch
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', `/branches/${branch.branch_id}/users`, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
                                console.log('Successfully added new user to branch:', newUser);
                            } else {
                                console.error('Error adding new user to branch:', xhr.statusText);
                            }
                        }
                    };
                    xhr.send(JSON.stringify(newUser));
                } else {
                    console.error('Please select a user to add to the branch');
                }
            }
        }
    });
});