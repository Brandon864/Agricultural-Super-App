// src/pages/ChatDashboard.js
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";
import "../App.css"; // Ensure App.css is imported for styling

function ChatDashboard() {
  // Renamed function component to ChatDashboard
  const { currentUser } = useSelector((state) => state.auth);
  const [selectedConversation, setSelectedConversation] = useState(null); // { type: 'user' | 'community', id: number, name: string }

  // Redirect if not logged in
  if (!currentUser) {
    return (
      <div className="page-container message-page">
        <p className="error-message">Please log in to view messages.</p>
        <div className="text-center">
          <Link to="/login" className="button primary-button">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container message-page">
      <h1 className="text-center">Your Messages</h1>
      <div className="messages-layout">
        <div className="conversation-list-panel">
          <h3>Conversations</h3>
          <ConversationList
            onSelectConversation={setSelectedConversation}
            currentUserId={currentUser.id}
          />
        </div>
        <div className="chat-window-panel">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={currentUser.id}
            />
          ) : (
            <div className="no-conversation-selected">
              <p>Select a conversation from the left to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatDashboard; // Renamed export to ChatDashboard
