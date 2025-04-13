import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';
await sdk.actions.ready();
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const askPrice = document.getElementById("askPrice");
const askQty = document.getElementById("askQty");
const bidPrice = document.getElementById("bidPrice");
const bidQty = document.getElementById("bidQty");
const userInput = document.getElementById("userInput");
const sym = document.getElementById("sym");
const success = document.getElementById("success");
const failed = document.getElementById("failed");
const alarmSound = document.getElementById('alarmSound');
const alarmEmoji = document.getElementById("alarmEmoji");

let alarm = false;
async function start(){

    uri = "wss://fstream.binance.com/ws/!bookTicker";
    const input = userInput.value.toUpperCase();
    let isTrue = await check(input);
    if (isTrue) {
        failed.textContent = "";
        startButton.style.opacity = "0.5";
        stopButton.style.opacity = "1";
        startButton.disabled = true;
        stopButton.disabled = false;
        success.style.color = "#0ba153";
        success.innerHTML = "Connected to server";
        const socket = new WebSocket(uri);
        socket.onopen = () => {
            console.log('Connected to server');
            sym.textContent = 'Getting data...';
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.s == input) {
                calAsk = Math.floor(Number(data.A) * Number(data.a));
                calBid = Math.floor(Number(data.B) * Number(data.b));
                const isBigSizeAsk = calAsk >= 1000000;
                const isBigSizeBid = calBid >= 1000000;
                sym.textContent = `Symbol:    ${data.s}`;
                askPrice.textContent = `${data.a}`;
                bidPrice.textContent = `${data.b}`;
                if (isBigSizeAsk) {
                    if (alarm) alarmSound.play();
                    askQty.style.color = '#f9d33a';
                    askQty.textContent = `${calAsk.toLocaleString()}`;
                    bidQty.textContent = `${calBid.toLocaleString()}`;
                } else if (isBigSizeBid) {
                    if (alarm) alarmSound.play();
                    bidQty.style.color = '#f9d33a';
                    bidQty.textContent = `${calBid.toLocaleString()}`;
                    askQty.textContent = `${calAsk.toLocaleString()}`;
                } else {
                    askQty.style.color = '#b8b8b8';
                    bidQty.style.color = '#b8b8b8';
                    askQty.textContent = `${calAsk.toLocaleString()}`;
                    bidQty.textContent = `${calBid.toLocaleString()}`;
                }
            }

        };

        socket.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        function stop(){
            if (socket && socket.readyState == WebSocket.OPEN) {
                socket.close();
            }
            startButton.style.opacity = "1";
            startButton.disabled = false;
            stopButton.disabled = true;
            console.log('Disconnected from server');
            success.style.color = "#9b255a";
            success.innerHTML = "Disconnected from server";
        }

        stopButton.addEventListener("click", function(){
            stop();
        });

    }  else {
        failed.textContent = "Invalid symbol Or Empty Field, Please try again.";
        userInput.value = '';
        userInput.focus();
    }

}

startButton.addEventListener("click", function() {
    start();
});


async function check(input){
    let isValid = false;
    url = "https://fapi.binance.com/fapi/v1/exchangeInfo";
    await fetch(url)
        .then(response => response.json())
        .then(data => {
            data.symbols.map(symbol => {
                if (symbol.symbol == input){
                    console.log('OK');
                    isValid = true;
                }
            });
        })
        .catch(error => {
            console.error('Error fetching symbols:', error);
        });
    return isValid;
}


function insertText(ticker) {
    const text = document.getElementById(ticker).innerText;
    userInput.value = text;
}

alarmEmoji.addEventListener('click', function () {
    if (alarm) {
        alarm = false;
        alarmEmoji.innerText = '🔇';
    } else {
        alarm = true;
        alarmEmoji.innerText = '🔊';
    }
})
