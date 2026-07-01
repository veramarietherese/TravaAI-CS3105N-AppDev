import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "../auth/supabaseClient";
import { useAuth } from "../auth/AuthContext"; // <-- Import your custom hook here
import "./UserChatScreen.css";

// ⚠️ Ensure this matches a valid trip ID row in your trips table
const FIXED_TRIP_ID = "185bf1e7-315e-4325-bc33-da8fbfffc44f";

export default function UserChatScreen({ onBack }) {
  // 1. Grab your authenticated user directly from your hook
  const { user } = useAuth();
  const myUserId = user?.id;

  const [recipient, setRecipient] = useState();
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // 2. Fetch another user from your table to act as the second person in the conversation
  useEffect(() => {
    if (!myUserId) return;

    const findSimulationTarget = async () => {
      const { data: users, error } = await supabase
        .from("users")
        .select("user_id, full_name, user_type")
        .not("user_id", "eq", myUserId) // Exclude yourself
        .limit(1);
      console.log("user error: ", error);
      console.log("user data: ", users[0]);
      if (!error && users && users.length > 0) {
        setRecipient(users[0]);
      }
    };

    findSimulationTarget();
  }, [myUserId]);

  // 3. Establish the chat room pairing between you and the discovered recipient
  useEffect(() => {
    if (!myUserId || !recipient) {
      console.log("Recipient: ", recipient);
      return;
    }
    const initializeRoom = async () => {
      const { data: existingRooms } = await supabase
        .from("chat_rooms")
        .select("room_id")
        .eq("trip_id", FIXED_TRIP_ID)
        .or(
          `and(sender_id.eq.${myUserId},receiver_id.eq.${recipient.user_id}),and(sender_id.eq.${recipient.user_id},receiver_id.eq.${myUserId})`,
        );

      if (existingRooms && existingRooms.length > 0) {
        setActiveRoomId(existingRooms[0].room_id);
      } else {
        const { data: newRoom, error } = await supabase
          .from("chat_rooms")
          .insert([
            {
              trip_id: FIXED_TRIP_ID,
              sender_id: myUserId,
              receiver_id: recipient.user_id,
              receiver_type:
                recipient.user_type === "Agency" ? "Agency" : "Friend",
            },
          ])
          .select()
          .single();

        if (!error && newRoom) setActiveRoomId(newRoom.room_id);
      }
    };

    initializeRoom();
  }, [myUserId, recipient]);

  // 4. Non-websocket message engine polling
  useEffect(() => {
    if (!activeRoomId) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [activeRoomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", activeRoomId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeRoomId || !myUserId) return;

    const currentText = input;
    setInput("");

    const { error } = await supabase.from("messages").insert([
      {
        room_id: activeRoomId,
        sender_id: myUserId,
        message_text: currentText,
      },
    ]);

    if (error) {
      setInput(currentText);
    } else {
      fetchMessages();
    }
  };

  if (!myUserId || !recipient) {
    return (
      <div className="loading-state">Loading user connection profiles...</div>
    );
  }

  return (
    <div className="user-chat-screen">
      <header className="chat-header">
        <button onClick={onBack} aria-label="Back" className="chat-back-btn">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1>{recipient.full_name}</h1>
          <p className="status-indicator">Connected • Database Mode</p>
        </div>
      </header>

      <div className="chat-messages-container" ref={scrollRef}>
        {messages.map((m) => {
          const isMe = m.sender_id === myUserId;
          return (
            <div
              key={m.message_id}
              className={`message-row ${isMe ? "message-row--me" : "message-row--them"}`}
            >
              <div className="message-bubble-wrapper">
                <div className="message-text-bubble">{m.message_text}</div>
                <span className="message-time-stamp">
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a real database message..."
        />
        <button onClick={handleSend} className="message-submit-btn">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
