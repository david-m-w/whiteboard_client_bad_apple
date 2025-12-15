// Verbindung zum Backend

const socket = io("https://reverse-blogging-advancement-coordinated.trycloudflare.com", {
    transports: ["websocket"],   // Erzwingt WebSocket-only
    secure: true
});


const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const resetBtn = document.getElementById("resetBtn");
const colorPreview = document.getElementById("colorPreview");

// Canvas-Größe anpassen
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

let drawing = false;
let color = "#000";   // Wird später vom Server ersetzt
let lastX = 0, lastY = 0;

// ------------------------
// Hilfsfunktionen
// ------------------------
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
}

function drawLine(l) {
    ctx.strokeStyle = l.color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(l.x0, l.y0);
    ctx.lineTo(l.x1, l.y1);
    ctx.stroke();
}

// ------------------------
// Lokale Zeichenfunktionen
// ------------------------
function start(e) {
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
}

function move(e) {
    if (!drawing) return;
    const pos = getPos(e);

    const line = {
        x0: lastX,
        y0: lastY,
        x1: pos.x,
        y1: pos.y,
        color: color
    };

    drawLine(line);            // lokal zeichnen
    socket.emit("drawing", line); // an Server senden

    lastX = pos.x;
    lastY = pos.y;
}

function stop() {
    drawing = false;
}

// ------------------------
// Canvas Events
// ------------------------
canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", stop);
canvas.addEventListener("mouseout", stop);

canvas.addEventListener("touchstart", start);
canvas.addEventListener("touchmove", move);
canvas.addEventListener("touchend", stop);

// ------------------------
// Reset Button
// ------------------------
resetBtn.onclick = () => socket.emit("resetCanvas");

// ------------------------
// Socket.io Events
// ------------------------
socket.on("userColor", (c) => {
    color = c;
    colorPreview.style.background = c;
});

socket.on("drawing", (line) => drawLine(line));

socket.on("loadDrawing", (lines) => lines.forEach(drawLine));

socket.on("resetCanvas", () => ctx.clearRect(0, 0, canvas.width, canvas.height));












console.log("bad_apple script loaded")

function setup(){

    

    const o=50;//constant offset for the whole canvas 

    const p=4; //constant pixel size 

    const fps=42; //based on the frames I got from the github, the delay is in the run.py file 

    const d=200; //delay in ms between frames that get drawn 

    const totalFrames=6572;//constant, see dataset 

    const w=98//fixed 

    const h=36;//fixed 
}







function getFileContent(url) { 
    const o=50;//constant offset for the whole canvas 
    
    const p=4; //constant pixel size 
    
    const fps=42; //based on the frames I got from the github, the delay is in the run.py file 
    
    const d=200; //delay in ms between frames that get drawn 
    
    const totalFrames=6572;//constant, see dataset 
    
    const w=98//fixed 
    
    const h=36;//fixed 
    
    const xhr = new XMLHttpRequest(); 
    
    xhr.open('GET', url, false); 
    
    xhr.send(null); 
    
    if (xhr.status === 200) { 
        
        console.log(xhr.responseText);
        return xhr.responseText; 
        
    } else { 
        
        return `Error: Could not fetch file. Status: ${xhr.status}`; 
        
    } 

} 


function sleep(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}


function sendFrame(frameNumber, reset){ 
    const o=50;//constant offset for the whole canvas 
    
    const p=4; //constant pixel size 
    
    const fps=42; //based on the frames I got from the github, the delay is in the run.py file 
    
    const d=200; //delay in ms between frames that get drawn 
    
    const totalFrames=6572;//constant, see dataset 
    
    const w=98//fixed 
    
    const h=36;//fixed 
    
    console.log("started on frame "+ String(frameNumber))
    
    leading_zeros = 4-String(frameNumber).length;
    leading_zeros_sring = "";
    for (let i = 0; i<leading_zeros; i++){
        leading_zeros_sring +="0"
    }
    
    textFull = getFileContent("/frames_ascii/out" + leading_zeros_sring + String(frameNumber) + ".jpg.txt"); 
    
    text = textFull.split("\n"); 
    
 if(reset){ 
     
     socket.emit("resetCanvas"); 
     
    } 

    
    
 //dra badapple frame 
 
 for (let i=0;i<h;i++){ 
     console.log("starting on line " + String(i));

     line=text[i]; 
     console.log(line);
     
     jOld=0; 
  
  j=0 //iterator; 
  
  while(j<w){ 
      
      

   while(line[j] == "@"){ //while it is @, so while fully black 
    console.log("black loop");
    j++; 
    if (j<w){
        j=w;
        break;
    }
} 
if (j<=w){
    break;
}

console.log("printint black: " + String(jOld) + " " + String(j));
socket.emit("drawing", {x0:o+p*jOld, y0:o+p*i, x1:o+p*j, y1:o+p*i, color:"#000000"}); 

jOld = j; 



while(line[j] != "@" && line[j] != " "){ //while not @ and not whitespace, so while gray 
    console.log("gray loop");
    
    j++; 
    if (j<w){
        j=w;
        break;
    }
    
} 
if (j<=w){
    break;
}

console.log("printint gray: " + String(jOld) + " " + String(j));
socket.emit("drawing", {x0:o+p*jOld, y0:o+p*i, x1:o+p*j, y1:o+p*i, color:"#888888"}); 

jOld = j; 



while(line[j] == " "){ //while it is whitespace, so while white 
    
    console.log("white loop");
    j++;
    if (j<w){
        j=w;
        break;
    }
    
} 
if (j<=w){
    break;
}

console.log("printint white: " + String(jOld) + " " + String(j));
socket.emit("drawing", {x0:o+p*jOld, y0:o+p*i, x1:o+p*j, y1:o+p*i, color:"#ffffff"}); 

jOld = j; 

} 

} 

} 



function apple(reset){ 
    const o=50;//constant offset for the whole canvas 
    
    const p=4; //constant pixel size 
    
    const fps=42; //based on the frames I got from the github, the delay is in the run.py file 
    
    const d=200; //delay in ms between frames that get drawn 
    
    const totalFrames=6572;//constant, see dataset 
    
    const w=98//fixed 
    
    const h=36;//fixed 
    
    frame = 1; 
    
    frameIncrement=parseInt(fps * d / 1000); 
 
 if (frameIncrement <= 0) { 
     
     frameIncrment = 1; 
     
     console.log("some error occurred witht the edlay and frame increment"); 
     
    } 
    
    while(frame<totalFrames){ 

  sendFrame(frame, reset); 
  
  frame += frameIncrement; 
  console.log("sleeping started");
  sleep(d); 
  console.log("sleeping finished");
  
} 

 if(reset){ 
     
     socket.emit("resetCanvas"); 
     
    } 

}




function send_bad_apple(){
    console.log("AAAAAAAAAAAAAAAA");
    apple(false);
}