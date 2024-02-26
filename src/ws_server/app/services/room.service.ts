import { WebSocketServer } from 'ws';
import { Room } from '../models';
import { WS_MSGS } from '../utils/constants';

interface UpdateRoomResponse {
    roomId: number;
    roomUsers: { name: string; index: number }[];
}

export class RoomService {
    updateRoom(wss: WebSocketServer, rooms: Room[]) {
        const updateRoomResponse: UpdateRoomResponse[] = [];

        rooms.forEach((room) => {
            const roomData = {
                roomId: room.id,
                roomUsers: [
                    {
                        name: room.users[0].name,
                        index: room.users[0].id,
                    },
                ],
            };

            updateRoomResponse.push(roomData);
        });

        wss.clients.forEach((client) => {
            client.send(
                JSON.stringify({
                    type: WS_MSGS.UPDATE_ROOM,
                    data: JSON.stringify(updateRoomResponse),
                    id: 0,
                })
            );
        });
    }
}
