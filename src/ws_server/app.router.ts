import WebSocket, { WebSocketServer } from 'ws';
import { User, Users, Room, Rooms } from './models';

class AppRouter {
    wss: WebSocketServer;
    users: Users;
    rooms: Rooms;

    constructor(wss: WebSocketServer, users: Users, rooms: Rooms) {
        this.wss = wss;
        this.users = users;
        this.rooms = rooms;
    }

    route(ws: WebSocket, user: User, message: string) {
        const msg = JSON.parse(message);

        const msgType = msg.type;

        let msgData: any = {};

        if (msg.data) {
            msgData = JSON.parse(msg.data);
        }

        switch (msgType) {
            case 'reg':
                user.name = msgData.name;
                user.password = msgData.password;

                this.users.addUser(user);

                ws.send(
                    JSON.stringify({
                        type: 'reg',
                        data: JSON.stringify({
                            name: user.name,
                            index: user.id,
                            error: false,
                            errorText: '',
                        }),
                        id: 0,
                    })
                );

                this.wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: 'update_room',
                            data: JSON.stringify(
                                this.rooms.getUpdateRoomResponse()
                            ),
                            id: 0,
                        })
                    );
                });

                this.wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: 'update_winners',
                            data: JSON.stringify(
                                this.users.getUpdateWinnersResponse()
                            ),
                            id: 0,
                        })
                    );
                });

                break;
            case 'create_room':
                const room = new Room();

                room.addUser(user);

                this.rooms.addRoom(room);

                this.wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: 'update_room',
                            data: JSON.stringify(
                                this.rooms.getUpdateRoomResponse()
                            ),
                            id: 0,
                        })
                    );
                });

                break;
            case 'add_user_to_room':
                this.rooms.getRoomById(msgData.indexRoom).addUser(user);

                // this.rooms
                //     .getRoomById(msgData.indexRoom)
                //     .game.setTurn(this.user.id);

                this.wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: 'update_room',
                            data: JSON.stringify(
                                this.rooms.getUpdateRoomResponse()
                            ),
                            id: 0,
                        })
                    );
                });

                this.rooms
                    .getRoomById(msgData.indexRoom)
                    .users.forEach((user) => {
                        user.connection.send(
                            JSON.stringify({
                                type: 'create_game',
                                data: JSON.stringify({
                                    idGame: this.rooms.getRoomById(
                                        msgData.indexRoom
                                    ).game.id,
                                    idPlayer: user.id,
                                }),
                                id: 0,
                            })
                        );
                    });

                break;
            case 'add_ships':
                this.rooms
                    .getGameById(msgData.gameId)
                    .getPlayer(user.id)
                    .setShips(msgData.ships);

                this.rooms.getGameById(msgData.gameId).setTurn(user.id);

                ws.send(
                    JSON.stringify({
                        type: 'start_game',
                        data: JSON.stringify({
                            ships: this.rooms
                                .getGameById(msgData.gameId)
                                .getPlayer(user.id).ships,
                            currentPlayerIndex: user.id,
                        }),
                        id: 0,
                    })
                );

                this.rooms
                    .getRoomById(this.rooms.getGameById(msgData.gameId).roomId)
                    .users.forEach((user) => {
                        user.connection.send(
                            JSON.stringify({
                                type: 'turn',
                                // data: JSON.stringify({
                                //     currentPlayer: user.id,
                                // }),
                                data: JSON.stringify({
                                    currentPlayer: this.rooms.getGameById(
                                        msgData.gameId
                                    ).turn,
                                }),
                                id: 0,
                            })
                        );
                    });

                break;
            case 'attack':
                const currentGameRoom = this.rooms.getRoomById(
                    this.rooms.getGameById(msgData.gameId).roomId
                );

                const currentPlayerId = user.id;

                const enemy = currentGameRoom.getEnemyUser(currentPlayerId);

                const res = currentGameRoom.game
                    .getPlayer(enemy.id)
                    .processShips({ x: msgData.x, y: msgData.y });

                switch (res.status) {
                    case 'miss':
                        currentGameRoom.users.forEach((user) => {
                            user.connection.send(
                                JSON.stringify({
                                    type: 'attack',
                                    data: JSON.stringify({
                                        position: {
                                            x: msgData.x,
                                            y: msgData.y,
                                        },
                                        currentPlayer: currentPlayerId,
                                        status: 'miss',
                                    }),
                                    id: 0,
                                })
                            );
                        });

                        currentGameRoom.game.turn = enemy.id;

                        currentGameRoom.users.forEach((user) => {
                            user.connection.send(
                                JSON.stringify({
                                    type: 'turn',
                                    data: JSON.stringify({
                                        currentPlayer:
                                            currentGameRoom.game.turn,
                                    }),
                                    id: 0,
                                })
                            );
                        });

                        break;
                    case 'shot':
                        // currentGameRoom.game.turn = this.user.id;

                        currentGameRoom.users.forEach((user) => {
                            user.connection.send(
                                JSON.stringify({
                                    type: 'attack',
                                    data: JSON.stringify({
                                        position: {
                                            x: msgData.x,
                                            y: msgData.y,
                                        },
                                        currentPlayer: currentPlayerId,
                                        status: 'shot',
                                    }),
                                    id: 0,
                                })
                            );
                        });

                        currentGameRoom.users.forEach((user) => {
                            user.connection.send(
                                JSON.stringify({
                                    type: 'turn',
                                    data: JSON.stringify({
                                        currentPlayer:
                                            currentGameRoom.game.turn,
                                    }),
                                    id: 0,
                                })
                            );
                        });

                        break;
                    case 'killed':
                        // currentGameRoom.game.turn = this.user.id;

                        currentGameRoom.users.forEach((user) => {
                            user.connection.send(
                                JSON.stringify({
                                    type: 'attack',
                                    data: JSON.stringify({
                                        position: {
                                            x: msgData.x,
                                            y: msgData.y,
                                        },
                                        currentPlayer: currentPlayerId,
                                        status: 'killed',
                                    }),
                                    id: 0,
                                })
                            );
                        });

                        for (let i = 0; i < res.points.length; i++) {
                            currentGameRoom.users.forEach((user) => {
                                user.connection.send(
                                    JSON.stringify({
                                        type: 'attack',
                                        data: JSON.stringify({
                                            position: res.points[i],
                                            currentPlayer: currentPlayerId,
                                            status: 'miss',
                                        }),
                                        id: 0,
                                    })
                                );
                            });
                        }

                        currentGameRoom.users.forEach((user) => {
                            user.connection.send(
                                JSON.stringify({
                                    type: 'turn',
                                    data: JSON.stringify({
                                        currentPlayer:
                                            currentGameRoom.game.turn,
                                    }),
                                    id: 0,
                                })
                            );
                        });

                        break;
                    case 'finish':
                        currentGameRoom.users.forEach((user) => {
                            user.connection.send(
                                JSON.stringify({
                                    type: 'attack',
                                    data: JSON.stringify({
                                        position: {
                                            x: msgData.x,
                                            y: msgData.y,
                                        },
                                        currentPlayer: currentPlayerId,
                                        status: 'killed',
                                    }),
                                    id: 0,
                                })
                            );
                        });

                        for (let i = 0; i < res.points.length; i++) {
                            currentGameRoom.users.forEach((user) => {
                                user.connection.send(
                                    JSON.stringify({
                                        type: 'attack',
                                        data: JSON.stringify({
                                            position: res.points[i],
                                            currentPlayer: currentPlayerId,
                                            status: 'miss',
                                        }),
                                        id: 0,
                                    })
                                );
                            });
                        }

                        currentGameRoom.users.forEach((user) => {
                            user.connection.send(
                                JSON.stringify({
                                    type: 'finish',
                                    data: JSON.stringify({
                                        winPlayer: currentPlayerId,
                                    }),
                                    id: 0,
                                })
                            );
                        });

                        break;
                }

                break;
        }
    }
}

export default AppRouter;
