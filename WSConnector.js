class WSConnector {
    constructor(URL,sub= []) {
        this.webSocket = new WebSocket(URL)
        this.observer = sub;
        this.webSocket.onmessage = (event) =>{
            let parse = JSON.parse(event.data);
           sub.filter(obj => typeof obj[parse.message] === "function").forEach(o=>o[parse.message](parse.payload));
        }
    }

    addSub(sub){
        this.observer += sub;
    }

    createRoom(){
        const msg = {
            message: "createRoom"
        };
        this.webSocket.send(JSON.stringify(msg));
    }


}