import { WebSocketServer } from 'ws';
import { User } from '../models';
import { WS_MSGS } from '../utils/constants';

interface RegResponse {
    name: string;
    index: number;
    error: boolean;
    errorText: string;
}

interface UpdateWinnersResponse {
    name: string;
    wins: number;
}

export class UserService {
    reg(user: User, error: boolean, errorText: string) {
        const regResponse: RegResponse = {
            name: user.name,
            index: user.id,
            error,
            errorText,
        };

        user.connection.send(
            JSON.stringify({
                type: WS_MSGS.REG,
                data: JSON.stringify(regResponse),
                id: 0,
            })
        );
    }

    updateWinners(wss: WebSocketServer, users: User[]) {
        const updateWinnersResponse: UpdateWinnersResponse[] = [];

        users.forEach((user) => {
            if (user.wins > 0) {
                updateWinnersResponse.push({
                    name: user.name,
                    wins: user.wins,
                });
            }
        });

        wss.clients.forEach((client) => {
            client.send(
                JSON.stringify({
                    type: WS_MSGS.UPDATE_WINNERS,
                    data: JSON.stringify(updateWinnersResponse),
                    id: 0,
                })
            );
        });
    }
}
