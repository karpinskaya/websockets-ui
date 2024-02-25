import { Room } from './room.model';
import { User } from './user.model';

interface RoomUsers {
    name: string;
    index: number;
}

interface GetRoomsRes {
    roomId: number;
    roomUsers: RoomUsers[];
}

interface GetWinnersRes {
    name: string;
    wins: number;
}

export class App {
    users: User[] = [];
    rooms: Room[] = [];

    addUser(user: User) {
        this.users.push(user);
    }

    addRoom(room: Room) {
        this.rooms.push(room);
    }

    getRooms() {
        let res: GetRoomsRes[] = [];

        this.rooms.forEach((room) => {
            if (room.users.length === 1) {
                res.push({
                    roomId: room.id,
                    roomUsers: [
                        { name: room.users[0].name, index: room.users[0].id },
                    ],
                });
            }
        });

        return res;
    }

    getRoomById(roomId: number) {
        return this.rooms.filter((room) => room.id === roomId)[0];
    }

    getRoomByGameId(gameId: number) {
        return this.rooms.filter((room) => room.game.id === gameId)[0];
    }

    getWinners() {
        let res: GetWinnersRes[] = [];

        this.users.forEach((user) => {
            if (user.wins > 0) {
                res.push({ name: user.name, wins: user.wins });
            }
        });

        return res;
    }
}
