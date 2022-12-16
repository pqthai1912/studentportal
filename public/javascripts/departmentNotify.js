/* 
<script src="https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.js"></script>
*/

// var socket =io("http://localhost:3000");
var socket =io("https://nodejsadvancedweb.herokuapp.com", { transports : ['websocket'] });

function sendMessage(){
    socket.emit("messageSent",{
        // "department": document.getElementById("department").value,
        "title": document.getElementById("title").value,
        "id": document.getElementById("id").value
        
    })
}
