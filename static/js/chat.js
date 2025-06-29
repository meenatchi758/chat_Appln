document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  let currentRoom = "";

  const chatBox = document.getElementById("chatBox");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("message");
  const imageInput = document.getElementById("image");
  const roomSelect = document.getElementById("roomSelect");

  window.joinRoom = () => {
    const selectedRoom = roomSelect.value;
    if (currentRoom !== "") {
      socket.emit("leave", { room: currentRoom });
    }
    currentRoom = selectedRoom;
    chatBox.innerHTML = "";
    socket.emit("join", { room: currentRoom });
  };
  document.getElementById("join-btn").addEventListener("click", function () {
  const selectedUser = document.getElementById("chat-select").value;
  if (selectedUser) {
    const roomName = [selectedUser, "{{ username }}"].sort().join("_");
    socket.emit("join", { room: roomName });

    // Optionally load messages for that room
  } else {
    alert("Please select a user to chat with.");
  }
});


  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    const file = imageInput.files[0];

    if (!message && !file) return;

    let imageUrl = "";

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      imageUrl = data.url;
    }

    socket.emit("send_message", {
      room: currentRoom,
      sender: document.querySelector("h2").textContent.split(", ")[1],
      message: message || null,
      image: imageUrl || null,
    });

    messageInput.value = "";
    imageInput.value = "";
  });

  socket.on("receive_message", (data) => {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("mb-2");

    if (data.message) {
      const p = document.createElement("p");
      p.textContent = `${data.sender}: ${data.message}`;
      msgDiv.appendChild(p);
    }

    if (data.image) {
      const img = document.createElement("img");
      img.src = data.image;
      img.alt = "image";
      img.style.maxWidth = "150px";
      msgDiv.appendChild(img);
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
});
