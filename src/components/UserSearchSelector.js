"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function UserSearchSelector({ 
  selectedUsers = [], 
  onUsersChange, 
  maxUsers = 10,
  excludeUsers = [],
  placeholder = "Search users by email or username..."
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/users/search?query=${encodeURIComponent(query)}&limit=20`
      );
      const data = await response.json();

      if (response.ok) {
        // Filter out already selected users and excluded users
        const filteredUsers = data.users.filter(user => 
          !selectedUsers.some(selected => selected.id === user.id) &&
          !excludeUsers.includes(user.id)
        );
        
        setSearchResults(filteredUsers);
        setShowDropdown(filteredUsers.length > 0);
      } else {
        console.error("Search failed:", data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);    } finally {
      setIsSearching(false);
    }
  }, [selectedUsers, excludeUsers]);

  const addUser = (user) => {
    if (selectedUsers.length >= maxUsers) {
      alert(`Maximum ${maxUsers} users allowed`);
      return;
    }

    const newSelectedUsers = [...selectedUsers, user];
    onUsersChange(newSelectedUsers);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const removeUser = (userId) => {
    const newSelectedUsers = selectedUsers.filter(user => user.id !== userId);
    onUsersChange(newSelectedUsers);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-textSecondary" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="pl-10 pr-10 bg-theme-background/50 border-theme-border/40 focus:border-theme-primary"
            disabled={selectedUsers.length >= maxUsers}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-theme-primary border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-theme-card border border-theme-border/40 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((user) => (
                    <motion.div
                      key={user.id}
                      whileHover={{ backgroundColor: "rgba(var(--theme-primary-rgb), 0.1)" }}
                      className="px-4 py-3 cursor-pointer border-b border-theme-border/20 last:border-b-0"
                      onClick={() => addUser(user)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-primary/70 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.username || user.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-theme-textSecondary truncate flex items-center">
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            {user.email}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-theme-primary/20 hover:bg-theme-primary/30 border border-theme-primary/40"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-theme-textSecondary">
                  <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No users found</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">
              Selected Members ({selectedUsers.length}/{maxUsers})
            </h4>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {selectedUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-theme-background/50 border border-theme-border/40 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-theme-success to-theme-success/70 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user.username || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-theme-textSecondary flex items-center">
                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeUser(user.id)}
                    className="text-theme-accent hover:text-white hover:bg-theme-accent/20"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Usage Hint */}
      <div className="text-xs text-theme-textSecondary">
        {selectedUsers.length === 0 && "Start typing to search for users"}
        {selectedUsers.length > 0 && selectedUsers.length < maxUsers && "Continue adding members or proceed to create vault"}
        {selectedUsers.length >= maxUsers && `Maximum ${maxUsers} members reached`}
      </div>
    </div>
  );
}
