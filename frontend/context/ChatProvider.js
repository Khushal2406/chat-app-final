"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@chakra-ui/react";
import api from "../src/config/api";
import io from "socket.io-client";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const toast = useToast();
  const router = useRouter();

  // Initialize user from localStorage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      // Set default language if not present
      if (!userInfo.preferredLanguage) {
        userInfo.preferredLanguage = "default";
      }
      setUser(userInfo);
    }

    if (!userInfo) {
      router.push("/");
    }
  }, [router]);

  // Socket.IO connection management
  useEffect(() => {
    let socket = null;

    if (!user) {
      return;
    }

    if (socket) {
      return;
    }

    const initializeSocket = () => {
      // Create Socket.IO connection
      socket = io("http://localhost:5000", {
        transports: ["websocket"],
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      socket.on("connect", () => {
        console.log("Socket.IO connected successfully");
        setSocketConnected(true);
        
        // Send user setup message
        socket.emit("setup", user);
      });

      socket.on("connected", () => {
        console.log("Socket.IO setup completed");
        fetchChats();
      });

      socket.on("disconnect", () => {
        console.log("Socket.IO disconnected");
        setSocketConnected(false);
      });

      socket.on("message received", (newMessage) => {
        console.log("New message received:", newMessage);
        
        // Check if message is from a different chat
        const isDifferentChat = !selectedChat || 
          (selectedChat._id !== newMessage.chat._id && 
           selectedChat._id !== newMessage.chat);
        
        if (isDifferentChat) {
          setNotification(prev => {
            const exists = prev.some(n => n._id === newMessage._id);
            if (!exists) {
              return [newMessage, ...prev];
            }
            return prev;
          });
        }

        // Update chats with latest message
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat._id === newMessage.chat._id || 
                chat._id === newMessage.chat) {
              return {
                ...chat,
                latestMessage: newMessage,
              };
            }
            return chat;
          });
        });
      });

      setSocket(socket);
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, selectedChat]);

  // Fetch chats only when user changes
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    if (!user?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await api.get("/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const sendMessage = (message) => {
    if (socket && socket.connected) {
      socket.emit("new message", message);
    }
  };

  const sendTypingStatus = (isTyping) => {
    if (socket && socket.connected && selectedChat) {
      if (isTyping) {
        socket.emit("typing", selectedChat._id);
      } else {
        socket.emit("stop typing", selectedChat._id);
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        sendMessage,
        sendTypingStatus,
        socketConnected,
        setSocketConnected,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;