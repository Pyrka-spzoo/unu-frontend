import {WebSocketServer} from 'ws';

const wss = new WebSocketServer({port: 8080});

const rooms = {}

class Player {
    constructor(nickname, ws) {
        this.nickname = nickname;
        this.ws = ws;
    }

    send(data) {
        this.ws.send(JSON.stringify(data));
    }
}

class Room {
    constructor() {
        // this.id = Math.random().toString(36).substring(7);
        this.id = 'a'
        this.players = [];
        this.isStarted = false;
    }

    addPlayer(ws) {
        this.players.push(ws);

        this.pushState()
    }

    pushState() {
        this.players.forEach(player => {
            player.send({
                type: 'roomState',
                id: this.id,
                state: {
                    players: this.players.map(player => player.nickname)
                }
            });
        })
    }
}

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(text) {
        const data = JSON.parse(text);
        console.log(data)
        const type = data.type;

        switch (type) {
            case 'createRoom': {
                const nickname = data.nickname;
                const room = new Room();
                rooms[room.id] = room;
                console.log('Room created', room.id);

                const player = new Player(nickname, ws);
                room.addPlayer(player);

                break;
            }

            case 'joinRoom': {
                const roomId = data.roomid;
                const room = rooms[roomId];
                if (!room) {
                    ws.send(JSON.stringify({type: 'error', message: 'Room not found'}));
                    return;
                }

                const nickname = data.nickname;
                const player = new Player(nickname, ws);
                room.addPlayer(player);
                break;
            }
        }
    });
});