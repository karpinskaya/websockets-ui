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
}

export class Users {
    users: User[] = [];

    addUser(user: User) {
        this.users.push(user);
    }

    getUpdateWinnersResponse() {
        const updateWinnersResponse: { name: string; wins: number }[] = [];

        this.users.forEach((user) => {
            if (user.wins > 0) {
                updateWinnersResponse.push({
                    name: user.name,
                    wins: user.wins,
                });
            }
        });

        return updateWinnersResponse;
    }
}
