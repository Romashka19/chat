const socket = io();

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");

let userName = "";

selectUser();
function selectUser(){
    userName = prompt("input you nick",'')
}

$.getJSON( "http://localhost:3000/messages", function( data ) {

    for(let i = 0;i<data.length;i++){
        const receivedMsg = `
          <div class="incoming__message">
            <div class="received__message">
                <div class="message__info">
                <span class="message__author">${data[i].user}</span>
                <span class="time_date">${data[i].time_date}</span>
              </div>
              <p>${data[i].message}</p>
            </div>
          </div>`;
        const myMsg = `
          <div class="outgoing__message">
            <div class="sent__message">
              <div class="message__info">
                <span class="message__author">Me</span>
                <span class="time_date">${data[i].time_date}</span>
              </div>
              <p>${data[i].message}</p>
            </div>
          </div>`;
        messageBox.innerHTML += data[i].user === userName ? myMsg : receivedMsg;
    }
});



const newUserConnected = (user) => {
    if (userName == ""){
        userName = user || `User${Math.floor(Math.random() * 1000000)}`;
    }
    socket.emit("new user", userName);
    addToUsersBox(userName);
};

const addToUsersBox = (userName) => {
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    }

    const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
    inboxPeople.innerHTML += userBox;
};




const addNewMessage = ({ user, message }) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

    const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
      <p>${message}</p>

    </div>
  </div>`;

    const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <div class="message__info">
        <span class="message__author">Me</span>
        <span class="time_date">${formattedTime}</span>
      </div>
      <p>${message}</p>
    </div>
  </div>`;

    messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

newUserConnected();

messageForm.addEventListener("submit", (e) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
    });

    $.ajax({
        type: "POST",
        url: "/upload",
        data: { user: userName, message: inputField.value, time_date: formattedTime },
        success: function(){
            console.log("done");
        }
    });
    inputField.value = "";
});

inputField.addEventListener("keyup", () => {
    socket.emit("typing", {
        isTyping: inputField.value.length > 0,
        nick: userName,
    });
});

socket.on("new user", function (data) {
    data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function (userName) {
    document.querySelector(`.${userName}-userlist`).remove();
});

socket.on("chat message", function (data) {
    addNewMessage({ user: data.nick, message: data.message });
});


socket.on("typing", function (data) {
    const { isTyping, nick } = data;

    if (!isTyping) {
        fallback.innerHTML = "";
        return;
    }

    fallback.innerHTML = `<p>${nick} is typing...</p>`;
});