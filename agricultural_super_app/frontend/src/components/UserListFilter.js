// src/components/UserListFilter.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Props: 'title' (e.g., "Followers"), 'users' (the array of user objects)
function UserListFilter({ title, users = [] }) {
  const [filterTerm, setFilterTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

  // Updates the filtered list whenever the original users prop or filterTerm changes
  useEffect(() => {
    if (!filterTerm.trim()) {
      setFilteredUsers(users); // If filter is empty, show all users
    } else {
      const lowerCaseFilter = filterTerm.toLowerCase();
      const results = users.filter(
        (user) => user.username.toLowerCase().includes(lowerCaseFilter) // Case-insensitive search
      );
      setFilteredUsers(results);
    }
  }, [filterTerm, users]); // Dependencies for useEffect

  return (
    <div className="user-list-filter-card bg-white p-6 rounded shadow-md mb-4">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <input
        type="text"
        placeholder={`Filter ${title.toLowerCase()}...`}
        value={filterTerm}
        onChange={(e) => setFilterTerm(e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
      />

      {/* Conditional rendering for no results / no items */}
      {filteredUsers.length === 0 && filterTerm.trim() && (
        <p className="text-gray-600">No users found matching "{filterTerm}".</p>
      )}
      {filteredUsers.length === 0 && !filterTerm.trim() && (
        <p className="text-gray-600">No {title.toLowerCase()} to display.</p>
      )}

      {/* Display the filtered list of users */}
      {filteredUsers.length > 0 && (
        <ul className="space-y-3">
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              className="flex items-center bg-gray-50 p-3 rounded-md"
            >
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={`${user.username}'s profile`}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs mr-3">
                  No Img
                </div>
              )}
              <Link
                to={`/users/${user.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {user.username}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserListFilter;
