import { Game, Point, Room, User } from '../models';
import { WS_MSGS } from '../utils/constants';

export class GameService {
    createGame(room: Room) {
        room.users.forEach((user) => {
            user.connection.send(
                JSON.stringify({
                    type: WS_MSGS.CREATE_GAME,
                    data: JSON.stringify({
                        idGame: room.game.id,
                        idPlayer: user.id,
                    }),
                    id: 0,
                })
            );
        });
    }

    startGame(game: Game, user: User) {
        user.connection.send(
            JSON.stringify({
                type: WS_MSGS.START_GAME,
                data: JSON.stringify({
                    ships: game.getPlayer(user.id).ships,
                    currentPlayerIndex: user.id,
                }),
                id: 0,
            })
        );
    }

    turn(room: Room) {
        room.users.forEach((user) => {
            user.connection.send(
                JSON.stringify({
                    type: WS_MSGS.TURN,
                    data: JSON.stringify({
                        currentPlayer: room.game.turn,
                    }),
                    id: 0,
                })
            );
        });
    }

    attack(room: Room, player: User, status: string, point: Point) {
        room.users.forEach((user) => {
            user.connection.send(
                JSON.stringify({
                    type: WS_MSGS.ATTACK,
                    data: JSON.stringify({
                        position: point,
                        currentPlayer: player.id,
                        status,
                    }),
                    id: 0,
                })
            );
        });
    }

    finish(room: Room, player: User) {
        room.users.forEach((user) => {
            user.connection.send(
                JSON.stringify({
                    type: WS_MSGS.FINISH,
                    data: JSON.stringify({
                        winPlayer: player.id,
                    }),
                    id: 0,
                })
            );
        });
    }
}
