const CARD_TEMPLATE = document.getElementById('cardTemplate')
const MY_CARDS = document.getElementById('myCards')
const HAND1 = document.getElementById('hand1')
const HAND2 = document.getElementById('hand2')
const STACK = document.getElementById('stack')
const SYMBOLS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+2', 'skip', 'reverse']
const COLORS = ['red', 'green', 'blue', 'yellow']

let ws = new WSConnector('ws://localhost:8080/ws',[WS_LOGGER])


let myCards = []

let state = 'menu'
let room = null
// let ws
// function connect(){
//     ws = new WebSocket('ws://localhost:8080')
//     ws.onopen = () => console.log('Connected')
//     ws.onclose = () => {
//         console.log('Disconnected')
//         room = null
//         state = 'menu'
//
//         setTimeout(connect, 1000)
//     }
//
//     ws.onmessage = (event) => {
//         const data = JSON.parse(event.data)
//         console.log(data)
//
//         switch (data.type) {
//             case 'roomState': {
//                 state = 'room'
//                 room = data.state
//                 break
//             }
//         }
//     }
// }

// setTimeout(connect, 100)

function createRoom() {
    const nicknameelem = document.getElementById('name')
    const nickname = nicknameelem.value

    // ws.send(JSON.stringify({ type: 'createRoom', nickname }))
    ws.createRoom()
}

function joinRoom(){
    const roomidelem = document.getElementById('room')
    const nicknameelem = document.getElementById('name')
    const roomid = roomidelem.value
    const nickname = nicknameelem.value
    ws.myInfo()
    // ws.send(JSON.stringify({ type: 'joinRoom', roomid, nickname }))
}

function updateMyCards() {
    myCards.forEach(card => card.checkValid())

    myCards.sort((a, b) => {
        if (a.color === b.color)
            return SYMBOLS.indexOf(a.symbol) - SYMBOLS.indexOf(b.symbol)
        return COLORS.indexOf(a.color) - COLORS.indexOf(b.color)
    })
    myCards.forEach(card => card.moveTo(MY_CARDS))
}

class Card {
    constructor(symbol, color) {
        this.symbol = symbol
        this.color = color
        this.onStack = false

        this.node = CARD_TEMPLATE.content.cloneNode(true).querySelector('.card')
        this.node.style.backgroundColor = color
        this.node.querySelector('h3').innerText = symbol

        this.node.addEventListener('click', () => this.play())
    }

    play() {
        if (this.onStack) return
        if (this.flipped) return

        if (currentCard && !this.canBePlayedOn(currentCard)) return

        currentCard.node.remove()
        currentCard = this
        this.moveTo(STACK)
        this.onStack = true
        myCards.splice(myCards.indexOf(this), 1)

        updateMyCards()
    }

    show(parent) {
        parent.appendChild(this.node)
    }

    moveTo(newParent) {
        newParent.appendChild(this.node)
    }

    canBePlayedOn(card) {
        if (this.color === 'black') return true

        return this.color === card.color || this.symbol === card.symbol
    }

    checkValid() {
        let valid = this.canBePlayedOn(currentCard)

        if (valid)
            this.node.classList.remove('invalid')
        else
            this.node.classList.add('invalid')
    }
}

class FlippedCard {
    constructor() {
        this.node = CARD_TEMPLATE.content.cloneNode(true).querySelector('.card')
        this.node.style.backgroundColor = 'black'
        this.node.querySelector('h3').innerText = 'FLIPPED'

        this.node.addEventListener('click', () => this.play())
    }

    play() {
        if (myCards.length === 0) return

        let card = myCards[Math.floor(Math.random() * myCards.length)]
        card.play()
    }

    show(parent) {
        parent.appendChild(this.node)
    }
}

let currentCard = new Card('0', 'red')
currentCard.show(STACK)

for (let i = 0; i < 10; i++) {
    let color = COLORS[Math.floor(Math.random() * COLORS.length)]
    let symbol = Math.floor(Math.random() * 10)
    myCards.push(new Card(symbol, color))
    myCards[i].show(MY_CARDS)
}
updateMyCards()

let hand1 = []
for (let i = 0; i < 5; i++) {
    let card = new FlippedCard()
    hand1.push(card)
    card.show(HAND1)
}

let hand2 = []
for (let i = 0; i < 5; i++) {
    let card = new FlippedCard()
    hand2.push(card)
    card.show(HAND2)
}