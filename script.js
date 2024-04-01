document.addEventListener('DOMContentLoaded', () => {
    class UserDirectory {
        constructor(options) {
            const { apiUrl, userMapperfn, displaySelector, filterSelector, storageKey = 'userData' } = options;
            this.apiUrl = apiUrl;
            this.userMapperfn = userMapperfn;
            this.storageKey = storageKey;
            this.displayElement = document.querySelector(displaySelector);
            this.filterElement = document.querySelector(filterSelector);

            this.initialize();
        }

        initialize() {
            this.loadData()
                .then(users => {
                    console.log(users);
                    this.populateDisplay(users);
                    this.createHeader();
                });

            this.filterElement.addEventListener('input', () =>
                this.filterUsers(this.filterElement.value)
            );
        }

        loadData() {
            const storedUserData = JSON.parse(localStorage.getItem(this.storageKey));

            if (storedUserData) {
                return Promise.resolve(storedUserData)
                    .then(users => {
                        this.users = users;
                        return users;
                    });
            }

            return fetch(this.apiUrl)
                .then(response => response.json())
                .then(results => this.userMapperfn(results))
                .then(users => {
                    this.users = users;
                    localStorage.setItem(this.storageKey, JSON.stringify(users));
                    return users;
                });
        }

        populateDisplay(users) {
            this.displayElement.querySelector('tbody').innerHTML = ''; // Clear previous rows
            users.forEach(user => {
                const tr = document.createElement('tr');
                Object.entries(user).forEach(([key, value]) => {
                    const td = document.createElement('td');
                    if (key === 'photo') {
                        const img = document.createElement('img');
                        img.src = value;
                        td.appendChild(img);
                    } else {
                        td.textContent = value;
                    }
                    tr.appendChild(td);
                });
                this.displayElement.querySelector('tbody').appendChild(tr);
            });
        }

        createHeader() {
            const thead = document.createElement('thead');
            const tr = document.createElement('tr');
            Object.keys(this.users[0]).forEach(columnName => {
                const th = document.createElement('th');
                th.textContent = columnName[0].toUpperCase() + columnName.slice(1);
                tr.appendChild(th);
            });
            thead.appendChild(tr);
            this.displayElement.querySelector('thead').appendChild(thead);
        }

        filterUsers(searchTerm) {
            const filteredUsers = this.users.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            this.populateDisplay(filteredUsers);
        }
    }

    const userDirectory = new UserDirectory({
        apiUrl: 'https://dummyjson.com/users',
        userMapperfn: (userData) => {
            return userData.users.map(({ firstName, lastName, birthDate, image, phone, email }) => {
                const userObj = {
                    name: `${firstName} ${lastName}`,
                    birthDate,
                    phone,
                    email,
                    photo: image,
                };
                return userObj;
            });
        },
        displaySelector: '#userTable',
        filterSelector: '#filterUsers',
    });
    console.log(userDirectory);
});