"use client";

import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import TypingIndicator from "./TypingIndicator";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../context/ChatProvider";
import api from "../src/config/api";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    socket,
    socketConnected,
    setChats,
  } = ChatState();

  // Use a ref to always have the latest selectedChat in event handlers
  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const fetchMessages = useCallback(async () => {
    if (!selectedChat || !user?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await api.get(`/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);

      // Clear notifications for this chat when messages are fetched
      setNotification((prev) =>
        prev.filter((n) => n.chat._id !== selectedChat._id)
      );

      // Join chat room
      if (socket && socketConnected) {
        socket.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }, [selectedChat, user, socket, socketConnected, setNotification, toast]);

  // Handle socket events (only set up once per socket)
  useEffect(() => {
    if (!socket || !socketConnected) {
      return;
    }

    const handleTyping = () => {
      setIsTyping(true);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
    };

    const handleNewMessage = (newMessageReceived) => {
      if (!newMessageReceived) return;

      // Check if the message belongs to the current chat
      const isCurrentChat =
        selectedChatRef.current &&
        (newMessageReceived.chat._id === selectedChatRef.current._id ||
          newMessageReceived.chat === selectedChatRef.current._id);

      if (isCurrentChat) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === newMessageReceived._id);
          if (exists) return prev;
          return [...prev, newMessageReceived];
        });

        // Scroll to bottom when new message arrives
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);
    socket.on("message received", handleNewMessage);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
      socket.off("message received", handleNewMessage);
    };
  }, [socket, socketConnected]);

  // Join/leave chat room on selectedChat change
  useEffect(() => {
    if (!socket || !socketConnected) return;
    if (selectedChat) {
      socket.emit("join chat", selectedChat._id);
    }
    return () => {
      if (selectedChat) {
        socket.emit("leave chat", selectedChat._id);
      }
    };
  }, [socket, socketConnected, selectedChat]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat, fetchMessages]);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      if (!selectedChat || !selectedChat._id) {
        toast({
          title: "Error!",
          description: "No chat selected or invalid chat",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      if (!socketConnected) {
        toast({
          title: "Connection Error",
          description: "Lost connection to server. Please refresh the page.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await api.post(
          "/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        // Emit the message event with the full message data
        socket.emit("new message", data);

        // Update local state
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === data._id);
          if (exists) return prev;
          return [...prev, data];
        });

        // Update chat list with latest message
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === selectedChat._id) {
              return {
                ...chat,
                latestMessage: data,
              };
            }
            return chat;
          });
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error Occurred!",
          description: error.response?.data?.message || "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !socketConnected) {
      console.log("Socket not connected, skipping typing event");
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
                <div ref={messagesEndRef} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {istyping ? <TypingIndicator /> : <></>}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
