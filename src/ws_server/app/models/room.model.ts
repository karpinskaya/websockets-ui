import { Game } from './game.model';
import { User } from './user.model';

export class Room {
    id: number;
    users: User[] = [];
    game: Game;

    static counter = 1;

    constructor() {
        this.id = Room.counter;
        this.game = new Game(this.id);

        Room.counter = Room.counter + 1;
    }

    addUser(user: User) {
        this.users.push(user);
        this.game.addPlayer(user.id);
    }

    getEnemyUser(userId: number) {
        return this.users.filter((user) => user.id !== userId)[0];
    }
}

export class Rooms {
    rooms: Room[] = [];

    addRoom(room: Room) {
        this.rooms.push(room);
    }

    getRoomsWithOneUser() {
        return this.rooms.filter((room) => room.users.length === 1);
    }

    getRoomById(roomId: number) {
        return this.rooms.filter((room) => room.id === roomId)[0];
    }

    getRoomByGameId(gameId: number) {
        return this.rooms.filter((room) => room.game.id === gameId)[0];
    }

    getRoomByUserId(userId: number) {
        return this.rooms.filter(
            (room) =>
                room.users[0]?.id === userId || room.users[1]?.id === userId
        )[0];
    }

    getGameById(gameId: number) {
        return this.rooms.filter((room) => room.game.id === gameId)[0].game;
    }

    deleteRoomById(roomId: number) {
        const index = this.rooms.findIndex((room) => {
            room.id === roomId;
        });

        this.rooms.splice(index, 1);
    }
}
