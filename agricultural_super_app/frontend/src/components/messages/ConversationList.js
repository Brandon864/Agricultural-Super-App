// src/components/messages/ConversationList.js
import React from "react";
// import { useSelector } from "react-redux"; // Removed: useSelector is not used in this component
import {
  useGetUsersQuery, // To list potential direct message contacts
  useGetUserJoinedCommunitiesQuery, // To list communities user has joined
} from "../../redux/api/apiSlice";
import "../../App.css"; // Ensure App.css is imported for styling

function ConversationList({ onSelectConversation, currentUserId }) {
  // Fetch all users to potentially message (excluding current user)
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useGetUsersQuery();

  // Fetch communities the current user has joined
  const {
    data: joinedCommunities,
    isLoading: communitiesLoading,
    isError: communitiesError,
  } = useGetUserJoinedCommunitiesQuery(currentUserId, {
    skip: !currentUserId,
  });

  const availableUsers =
    users?.filter((user) => user.id !== currentUserId) || [];

  if (usersLoading || communitiesLoading) {
    return <p className="loading-message">Loading conversations...</p>;
  }

  if (usersError || communitiesError) {
    return (
      <p className="error-message">Error loading contacts or communities.</p>
    );
  }

  return (
    <div className="conversation-list">
      <h4>Direct Messages</h4>
      <ul className="conversation-list-ul">
        {availableUsers.length > 0 ? (
          availableUsers.map((user) => (
            <li
              key={`user-${user.id}`}
              className="conversation-list-item"
              onClick={() =>
                onSelectConversation({
                  type: "user",
                  id: user.id,
                  name: user.username,
                })
              }
            >
              <img
                src={
                  user.profile_picture_url ||
                  "https://placehold.co/50x50/cccccc/333333?text=User"
                }
                alt={user.username}
                className="conversation-avatar"
              />
              <span className="conversation-name">{user.username}</span>
            </li>
          ))
        ) : (
          <p className="no-content-message">No other users found.</p>
        )}
      </ul>

      <h4 className="mt-4">Community Chats</h4>
      <ul className="conversation-list-ul">
        {joinedCommunities && joinedCommunities.length > 0 ? (
          joinedCommunities.map((community) => (
            <li
              key={`community-${community.id}`}
              className="conversation-list-item"
              onClick={() =>
                onSelectConversation({
                  type: "community",
                  id: community.id,
                  name: community.name,
                })
              }
            >
              <img
                src={"https://placehold.co/50x50/4CAF50/ffffff?text=Comm"} // Placeholder for community icon
                alt={community.name}
                className="conversation-avatar"
              />
              <span className="conversation-name">{community.name}</span>
            </li>
          ))
        ) : (
          <p className="no-content-message">
            Not a member of any communities with chat.
          </p>
        )}
      </ul>
    </div>
  );
}

export default ConversationList;
