import WebSocket from 'ws';

export class User {
    id: number;
    connection: WebSocket;
    name: string;
    password: string;
    wins: number = 0;

    static counter = 1;

    constructor(connection: WebSocket, name: string, password: string) {
        this.id = User.counter;
        this.connection = connection;
        this.name = name;
        this.password = password;

        User.counter = User.counter + 1;
    }

    updateWins() {
        this.wins = this.wins + 1;
    }
}

export class Users {
    users: User[] = [];

    addUser(user: User) {
        let exists = false;

        this.users.forEach((thisUser) => {
            if (thisUser.name === user.name) {
                exists = true;

                if (thisUser.password !== user.password) {
                    throw new Error('Wrong password');
                }
            }
        });

        if (!exists) {
            this.users.push(user);
        }
    }

    getAllUsers() {
        return this.users;
    }

    getUserByUserName(userName: string) {
        return this.users.filter((user) => user.name === userName)[0];
    }
}
