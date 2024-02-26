import WebSocket, { WebSocketServer } from 'ws';
import { Room, Rooms, User, Users, Point } from './models';
import { GameService, RoomService, UserService } from './services';
import { WS_MSGS } from './utils/constants';

class App {
    wss: WebSocketServer;
    rooms: Rooms;
    users: Users;
    gameService: GameService;
    roomService: RoomService;
    userService: UserService;

    constructor() {
        this.wss = new WebSocket.Server({ port: 3000 });
        this.rooms = new Rooms();
        this.users = new Users();
        this.gameService = new GameService();
        this.roomService = new RoomService();
        this.userService = new UserService();
    }

    listen() {
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('New client connected');

            let user = new User(ws, '', '');

            ws.on('message', (message: string) => {
                console.log(`Received message: ${message}`);

                const msg = JSON.parse(message);

                if (msg.data) {
                    msg.data = JSON.parse(msg.data);
                }

                if (msg.type === WS_MSGS.RANDOM_ATTACK) {
                    msg.type = WS_MSGS.ATTACK;

                    msg.data.x = Math.floor(Math.random() * 10);
                    msg.data.y = Math.floor(Math.random() * 10);
                }

                switch (msg.type) {
                    case WS_MSGS.REG:
                        user.name = msg.data.name;
                        user.password = msg.data.password;

                        let error = false;
                        let errorText = '';

                        try {
                            this.users.addUser(user);
                        } catch (e: any) {
                            error = true;
                            errorText = e.message;
                        }

                        if (!error) {
                            user = this.users.getUserByUserName(user.name);
                            user.connection = ws;
                        }

                        console.log(user);

                        this.userService.reg(user, error, errorText);

                        this.roomService.updateRoom(
                            this.wss,
                            this.rooms.getRoomsWithOneUser()
                        );

                        this.userService.updateWinners(
                            this.wss,
                            this.users.getAllUsers()
                        );

                        break;
                    case WS_MSGS.CREATE_ROOM:
                        const room = new Room();

                        room.addUser(user);

                        this.rooms.addRoom(room);

                        this.roomService.updateRoom(
                            this.wss,
                            this.rooms.getRoomsWithOneUser()
                        );

                        break;
                    case WS_MSGS.ADD_USER_TO_ROOM:
                        console.log(this.rooms.rooms);

                        if (
                            this.rooms.getRoomById(msg.data.indexRoom).users
                                .length === 0 &&
                            this.rooms.getRoomById(msg.data.indexRoom).users[0]
                                .id === user.id
                        ) {
                            return;
                        }

                        this.rooms
                            .getRoomById(msg.data.indexRoom)
                            .addUser(user);

                        this.roomService.updateRoom(
                            this.wss,
                            this.rooms.getRoomsWithOneUser()
                        );

                        this.gameService.createGame(
                            this.rooms.getRoomById(msg.data.indexRoom)
                        );

                        break;
                    case WS_MSGS.ADD_SHIPS:
                        this.rooms
                            .getGameById(msg.data.gameId)
                            .getPlayer(user.id)
                            .setShips(msg.data.ships);

                        this.rooms
                            .getGameById(msg.data.gameId)
                            .setTurn(user.id);

                        this.gameService.startGame(
                            this.rooms.getGameById(msg.data.gameId),
                            user
                        );

                        this.gameService.turn(
                            this.rooms.getRoomByGameId(msg.data.gameId)
                        );

                        break;
                    case WS_MSGS.ATTACK:
                        let point: Point = {
                            x: msg.data.x,
                            y: msg.data.y,
                        };

                        const currentGameRoom = this.rooms.getRoomByGameId(
                            msg.data.gameId
                        );

                        const player = user;

                        const enemy = currentGameRoom.getEnemyUser(player.id);

                        const res = currentGameRoom.game
                            .getPlayer(enemy.id)
                            .processShips(point);

                        switch (res.status) {
                            case WS_MSGS.MISS:
                                this.gameService.attack(
                                    currentGameRoom,
                                    player,
                                    WS_MSGS.MISS,
                                    point
                                );

                                currentGameRoom.game.turn = enemy.id;

                                this.gameService.turn(
                                    this.rooms.getRoomByGameId(msg.data.gameId)
                                );

                                break;
                            case WS_MSGS.SHOT:
                                this.gameService.attack(
                                    currentGameRoom,
                                    player,
                                    WS_MSGS.SHOT,
                                    point
                                );

                                this.gameService.turn(
                                    this.rooms.getRoomByGameId(msg.data.gameId)
                                );

                                break;
                            case WS_MSGS.KILLED:
                                this.gameService.attack(
                                    currentGameRoom,
                                    player,
                                    WS_MSGS.KILLED,
                                    point
                                );

                                for (let i = 0; i < res.points.length; i++) {
                                    this.gameService.attack(
                                        currentGameRoom,
                                        player,
                                        WS_MSGS.MISS,
                                        res.points[i]
                                    );
                                }

                                this.gameService.turn(
                                    this.rooms.getRoomByGameId(msg.data.gameId)
                                );

                                break;
                            case WS_MSGS.FINISH:
                                this.gameService.attack(
                                    currentGameRoom,
                                    player,
                                    WS_MSGS.KILLED,
                                    point
                                );

                                for (let i = 0; i < res.points.length; i++) {
                                    this.gameService.attack(
                                        currentGameRoom,
                                        player,
                                        WS_MSGS.MISS,
                                        res.points[i]
                                    );
                                }

                                this.gameService.finish(
                                    currentGameRoom,
                                    player
                                );

                                player.updateWins();

                                currentGameRoom.game.setWinner(player.id);

                                this.userService.updateWinners(
                                    this.wss,
                                    this.users.getAllUsers()
                                );

                                this.rooms.deleteRoomById(currentGameRoom.id);

                                break;
                        }

                        break;
                }
            });

            ws.on('close', () => {
                const currentGameRoom = this.rooms.getRoomByUserId(user.id);

                if (currentGameRoom && !currentGameRoom.game.winner) {
                    const enemy = currentGameRoom.getEnemyUser(user.id);

                    this.gameService.finish(currentGameRoom, enemy);

                    enemy.updateWins();

                    this.userService.updateWinners(
                        this.wss,
                        this.users.getAllUsers()
                    );

                    this.rooms.deleteRoomById(currentGameRoom.id);
                }

                user.connection.close();

                console.log('Client disconnected');
            });
        });
    }
}

export default App;
