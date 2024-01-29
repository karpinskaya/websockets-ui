import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000, host: 'localhost' }, () =>
    console.log('Server has been started on 3000 port using WS!')
);

wss.on('connection', (ws) => {
    try {
        console.log('Connected to WS!');
        ws.on('message', (message) => {
            console.log(message);
            message = JSON.parse(message);
            message.data = JSON.parse(message.data);

            let responseData = {};

            // const updateRoomData = {
            //     type: 'update_room',
            //     data: [
            //         {
            //             roomId: 2,
            //             roomUsers: [
            //                 {
            //                     name: messageData.name,
            //                     index: 1,
            //                 },
            //             ],
            //         },
            //     ],
            //     id: message.id,
            // };
            // updateRoomData.data = JSON.stringify(updateRoomData.data);

            // const updateWinnersData = {
            //     type: 'update_winners',
            //     data: [
            //         {
            //             name: message.name,
            //             wins: 1,
            //         },
            //     ],
            //     id: message.id,
            // };
            // updateWinnersData.data = JSON.stringify(updateWinnersData.data);

            switch (message.type) {
                case 'reg':
                    responseData = {
                        type: message.type,
                        data: {
                            name: message.data.name,
                            index: 1,
                            error: false,
                            errorText: 'Error message',
                        },
                        id: message.id,
                    };
                    responseData.data = JSON.stringify(responseData.data);
                    break;
                case 'create_room':
                    //
                    break;
                case 'add_user_to_room':
                    //
                    break;
                case 'add_ships':
                    //
                    break;
            }

            ws.send(JSON.stringify(responseData));
        });
    } catch (e) {
        console.log(e);
    }
});
