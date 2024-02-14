import WebSocket from 'ws';

let users: Object[] = [];

export class App {
    private _users: User[] = [];
    private _rooms: Room[] = [];

    // users
    get users() {
        return this._users;
    }

    addUser(user: User) {
        this._users.push(user);
    }

    // rooms
    get rooms() {
        return this._rooms;
    }

    addRoom(room: Room) {
        this._rooms.push(room);
    }
}

export class User {
    connection: WebSocket;
    name: string;
    password: string;
    id: number;
    wins: number;

    static counter = 1;

    constructor(connection: WebSocket, name: string, password: string) {
        this.connection = connection;
        this.name = name;
        this.password = password;
        this.id = User.counter;
        this.wins = 0;
        User.counter = User.counter + 1;
    }
}

export class Room {
    private _players: User[] = [];
    id: number;

    static counter = 1;

    constructor() {
        this.id = Room.counter;
        Room.counter = Room.counter + 1;
    }

    get players() {
        return this._players;
    }

    addPlayer(user: User) {
        if (this._players.length < 2) {
            this._players.push(user);
        } else {
            throw new Error('Room is not available to add new player');
        }
    }
}

export class Game {
    //
}

const wss = new WebSocket.Server({ port: 3000 });

const app = new App();

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    const user = new User(ws, '', '');

    ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`);

        const msg = JSON.parse(message);

        if (msg.data) {
            msg.data = JSON.parse(msg.data);
        }

        switch (msg.type) {
            case 'reg':
                user.name = msg.data.name;
                user.password = msg.data.password;

                app.addUser(user);

                users.push({
                    name: msg.data.name,
                    password: msg.data.password,
                });

                const reg_rooms = app.rooms.map((room) => {
                    if (room.players.length === 1) {
                        return {
                            roomId: room.id,
                            roomUsers: [
                                {
                                    name: room.players[0].name,
                                    index: room.players[0].id,
                                },
                            ],
                        };
                    }
                });

                const reg_winners = app.users.map((user) => ({
                    name: user.name,
                    wins: user.wins,
                }));

                ws.send(
                    JSON.stringify({
                        type: 'reg',
                        data: JSON.stringify({
                            name: msg.data.name,
                            index: 1,
                            error: false,
                            errorText: '',
                        }),
                        id: 0,
                    })
                );

                wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: 'update_room',
                            data: JSON.stringify(reg_rooms),
                            id: 0,
                        })
                    );
                });

                wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: 'update_winners',
                            data: JSON.stringify(reg_winners),
                            id: 0,
                        })
                    );
                });

                break;
            case 'create_room':
                const room = new Room();

                //

                room.addPlayer(user);
                app.addRoom(room);

                const rooms = app.rooms.map((room) => {
                    if (room.players.length === 1) {
                        return {
                            roomId: room.id,
                            roomUsers: [
                                {
                                    name: room.players[0].name,
                                    index: room.players[0].id,
                                },
                            ],
                        };
                    }
                });

                wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: 'update_room',
                            data: JSON.stringify(rooms),
                            id: 0,
                        })
                    );
                });

                break;
            case 'add_user_to_room':
                const current_room = app.rooms.filter(
                    (room) => room.id === msg.data.indexRoom
                )[0];

                current_room.addPlayer(user);

                let current_rooms: Object[] = [];

                app.rooms.forEach((room) => {
                    if (room.players.length === 1) {
                        current_rooms.push({
                            roomId: room.id,
                            roomUsers: [
                                {
                                    name: room.players[0].name,
                                    index: room.players[0].id,
                                },
                            ],
                        });
                    }
                });

                wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: 'update_room',
                            data: JSON.stringify(current_rooms),
                            id: 0,
                        })
                    );
                });

                current_room.players.forEach((player, index) => {
                    player.connection.send(
                        JSON.stringify({
                            type: 'create_game',
                            data: JSON.stringify({
                                idGame: 1,
                                idPlayer: index,
                            }),
                            id: 0,
                        })
                    );
                });

                break;
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
