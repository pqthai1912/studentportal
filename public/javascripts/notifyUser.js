//http://localhost:3000
var socket =io("https://nodejsadvancedweb.herokuapp.com", { transports : ['websocket'] });

socket.on("messageSent", function(message) {
    // console.log(message)
    showMess(message)
});


function showMess(message){

    const section = document.createElement('section')  // tạo 1 phần tử section
    // div.setAttribute("id", "notify-socket");
    // document.getElementById("notify-socket").className = "callout callout-info";
    // div.classList.add('callout callout-info') // đưa class message vào thẻ div
    section.innerHTML = `<div class="callout1 callout-info"><span> 
                            <a style="display:inline-block;" href="/admin/notification/detail" style="text-decoration: none;">
                                <p ><b>Vừa có một thông báo mới: </b>` + message.title + `</p>
                            </a></span>
                            <span>
                                <i id="xx" class="fa fa-close" style="display:inline-block;" onclick="closeMsg();"></i></div>
                            </span>
                        `

    document.querySelector('.content-header').appendChild(section) // nối thẻ div vào thẻ chứa class chat-message

}

function closeMsg(){
    $('.content-header').remove();
}