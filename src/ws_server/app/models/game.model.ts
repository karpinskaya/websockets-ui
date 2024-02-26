import { Player } from './player.model';

export class Game {
    id: number;
    roomId: number;
    players: Player[] = [];
    turn: number = 0;
    winner: number = 0;

    static counter = 1;

    constructor(roomId: number) {
        this.id = Game.counter;
        this.roomId = roomId;

        Game.counter = Game.counter + 1;
    }

    addPlayer(userId: number) {
        const player = new Player(userId);
        this.players.push(player);
    }

    setTurn(userId: number) {
        this.turn = userId;
    }

    getPlayer(userId: number) {
        return this.players.filter((player) => player.userId === userId)[0];
    }

    setWinner(userId: number) {
        this.winner = userId;
    }
}
