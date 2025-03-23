import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:4000");

console.log(socket)

const Home = () => {
  const [room, setRoom] = useState("general");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState("");
  const [file, setFile] = useState(null);
  const username = localStorage.getItem("username"); // Assume user is authenticated and stored in localStorage

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:4000/messages/${room}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err.message);
      }
    };

    fetchMessages();

    socket.emit("joinRoom", { room });

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("userTyping", ({ username }) => setTyping(`${username} is typing...`));
    socket.on("userStoppedTyping", () => setTyping(""));

    return () => socket.disconnect();
  }, [room]);

  const sendMessage = async () => {
    if (!message.trim() && !file) return;

    const type = file ? "media" : "text";
    let content = message;

    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token");
        const res = await axios.post("http://localhost:4000/upload", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        content = res.data.filePath;
      } catch (err) {
        console.error("File upload failed:", err.message);
        return;
      }
    }

    socket.emit("sendMessage", { sender: username, content, room, type });
    setMessages((prev) => [
      ...prev,
      { sender: username, content, type, room, status: "sent" },
    ]);
    setMessage("");
    setFile(null);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="max-w-lg w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">WhatsApp Clone</h2>

        {/* Room Selector */}
        <select
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="general">General</option>
          <option value="friends">Friends</option>
          <option value="work">Work</option>
        </select>

        {/* Messages */}
        <div className="h-64 overflow-y-auto border p-2 mb-4 rounded">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              <strong>{msg.sender}:</strong>{" "}
              {msg.type === "media" ? (
                <img
                  src={`http://localhost:4000${msg.content}`}
                  alt="Media"
                  className="h-32"
                />
              ) : (
                <span>{msg.content}</span>
              )}
              <span className="text-xs text-gray-500 ml-2">({msg.status})</span>
            </div>
          ))}
        </div>

        {/* Typing Indicator */}
        {typing && <p className="text-sm text-gray-500">{typing}</p>}

        {/* Input Section */}
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={() => socket.emit("typing", { room, username })}
            onKeyUp={() => socket.emit("stopTyping", { room, username })}
            className="flex-grow p-2 border rounded"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded ml-2"
          >
            Upload
          </label>
          <button
            onClick={sendMessage}
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
