import WebSocket, { WebSocketServer } from 'ws';
import { User, Users, Rooms } from './models';
import AppRouter from './app.router';

class App {
    wss: WebSocketServer;
    users: Users;
    rooms: Rooms;
    router: AppRouter;

    constructor() {
        this.wss = new WebSocket.Server({ port: 3000 });
        this.users = new Users();
        this.rooms = new Rooms();
        this.router = new AppRouter(this.wss, this.users, this.rooms);
    }

    listen() {
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('New client connected');

            const user = new User(ws, '', '');

            ws.on('message', (message: string) => {
                console.log(`Received message: ${message}`);

                this.router.route(ws, user, message);
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });
        });
    }
}

export default App;
