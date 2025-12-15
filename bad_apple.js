console.log("bad_apple script loaded")




o=50;//constant offset for the whole canvas 

p=4; //constant pixel size 

fps=42; //based on the frames I got from the github, the delay is in the run.py file 

d=1000; //delay in ms between frames that get drawn 

totalFrames=6572;//constant, see dataset 

w=98//fixed 

h=36;//fixed 

 

 

function getFileContent(url) { 
    
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

 



function sendFrame(frameNumber, reset){ 

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

  line=text[i]; 

  jOld=0; 
  
  j=0 //iterator; 
  
  while(j<w){ 
      
 

   while(line[j] == "@"){ //while it is @, so while fully black 

    j++; 
    
} 

socket.emit("drawing", {x0:o+p*jOld, y0:o+p*i, x1:o+p*j, y1:o+p*i, color:"#000000"}); 

   jOld = j; 

   

   while(line[j] != "@" && line[j] != " "){ //while not @ and not whitespace, so while gray 

    j++; 

   } 

   socket.emit("drawing", {x0:o+p*jOld, y0:o+p*i, x1:o+p*j, y1:o+p*i, color:"#888888"}); 

   jOld = j; 

 

   while(line[j] == " "){ //while it is whitespace, so while white 

    j++; 

   } 

   socket.emit("drawing", {x0:o+p*jOld, y0:o+p*i, x1:o+p*j, y1:o+p*i, color:"#ffffff"}); 
   
   jOld = j; 

} 

 } 

} 



function apple(reset){ 

 frame = 1; 

 frameIncrement=parseInt(fps * d / 1000); 

 if (frameIncrement <= 0) { 

  frameIncrment = 1; 

  console.log("some error occurred witht the edlay and frame increment"); 

 } 

 while(frame<totalFrames){ 

  sendFrame(frame, reset); 

  frame += frameIncrement; 

  sleep(d); 
  
 } 
 
 if(reset){ 

     socket.emit("resetCanvas"); 

 } 

}



function send_bad_apple(){
    console.log("AAAAAAAAAAAAAAAA");
    apple(false);
}