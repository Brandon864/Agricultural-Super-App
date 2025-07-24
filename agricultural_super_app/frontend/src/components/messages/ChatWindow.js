// src/components/messages/ChatWindow.js
import React, { useState, useEffect, useRef } from "react";
import {
  useGetDirectMessagesQuery,
  useGetCommunityMessagesQuery,
  useSendMessageMutation,
} from "../../redux/api/apiSlice";
import "../../App.css"; // Ensure App.css is imported for styling

function ChatWindow({ conversation, currentUserId }) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  // Call both hooks unconditionally at the top level
  const {
    data: directMessages,
    isLoading: directMessagesLoading,
    isError: directMessagesError,
    error: directMessagesFetchError,
  } = useGetDirectMessagesQuery(conversation.id, {
    skip: conversation.type !== "user", // Skip if not a direct message
  });

  const {
    data: communityMessages,
    isLoading: communityMessagesLoading,
    isError: communityMessagesError,
    error: communityMessagesFetchError,
  } = useGetCommunityMessagesQuery(conversation.id, {
    skip: conversation.type !== "community", // Skip if not a community message
  });

  // Select the correct messages based on conversation type
  const messages =
    conversation.type === "user" ? directMessages : communityMessages;
  const messagesLoading =
    conversation.type === "user"
      ? directMessagesLoading
      : communityMessagesLoading;
  const messagesError =
    conversation.type === "user" ? directMessagesError : communityMessagesError;
  const messagesFetchError =
    conversation.type === "user"
      ? directMessagesFetchError
      : communityMessagesFetchError;

  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();

  // Scroll to the latest message when messages load or update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const messagePayload = {
      text: messageText.trim(),
      sender_id: currentUserId, // Backend might infer this, but good to include
    };

    if (conversation.type === "user") {
      messagePayload.receiver_id = conversation.id;
    } else {
      messagePayload.community_id = conversation.id;
    }

    try {
      await sendMessage(messagePayload).unwrap();
      setMessageText(""); // Clear input after sending
    } catch (err) {
      console.error("Failed to send message:", err);
      // You might want to display an error message to the user here
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h4>{conversation.name}</h4>
      </div>
      <div className="message-list">
        {messagesLoading ? (
          <p className="loading-message">Loading messages...</p>
        ) : messagesError ? (
          <p className="error-message">
            Error loading messages:{" "}
            {messagesFetchError?.data?.message || "Unknown error"}
          </p>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-item ${
                msg.sender_id === currentUserId ? "my-message" : "other-message"
              }`}
            >
              <div className="message-bubble">
                <span className="message-sender">
                  {msg.sender_id === currentUserId
                    ? "You"
                    : msg.sender_username || "Unknown User"}
                </span>
                <p className="message-text">{msg.text}</p>
                <span className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-content-message">
            No messages yet. Start the conversation!
          </p>
        )}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </div>
      <form onSubmit={handleSendMessage} className="message-input-form">
        <textarea
          className="message-textarea"
          value={messageText}
          onChange={(e) =>
            e.target.value.length <= 500 && setMessageText(e.target.value)
          } // Limit input to 500 characters
          placeholder="Type your message (max 500 characters)..."
          rows="3"
          disabled={sendingMessage}
          maxLength="500" // HTML attribute for max length
        />
        <button
          type="submit"
          className="button primary-button send-button"
          disabled={sendingMessage}
        >
          {sendingMessage ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
