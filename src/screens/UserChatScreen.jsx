// src/pages/ChatPage.jsx
import React, { useState } from "react";
import ChatroomsList from "../components/ChatroomsList";
import ChatWindow from "../components/ChatWindow";
import "./UserChatScreen.css"; // See CSS below

export default function ChatPage() {
  const [activeRoom, setActiveRoom] = useState(null);

  return (
    <main className="app-shell">
      {!activeRoom ? (
        <div className="view-layer">
          <ChatroomsList onSelectRoom={(room) => setActiveRoom(room)} />
        </div>
      ) : (
        <div className="view-layer slide-in">
          <ChatWindow room={activeRoom} onGoBack={() => setActiveRoom(null)} />
        </div>
      )}
    </main>
  );
}
