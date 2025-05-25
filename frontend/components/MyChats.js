"use client";

import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button, Avatar } from "@chakra-ui/react";
import { ChatState } from "../context/ChatProvider";
import api from "../src/config/api";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
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
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      d="flex"
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w="31%"
      borderRadius="lg"
      borderWidth="1px"
      boxShadow="md"
      minH="80vh"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "14px", md: "15px", lg: "16px" }}
            rightIcon={<AddIcon />}
            colorScheme="blue"
            rounded="full"
            px={{ base: 2, md: 3, lg: 4 }}
            py={{ base: 1, md: 1.5, lg: 2 }}
            boxShadow="sm"
            size={{ base: "sm", md: "md" }}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            maxW={{ base: "120px", md: "140px", lg: "160px" }}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="auto"
        boxShadow="xs"
      >
        {chats ? (
          <Stack spacing={2} divider={<Box borderBottom="1px solid #e2e8f0" />}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "white"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                d="flex"
                alignItems="center"
                _hover={{ bg: selectedChat === chat ? "#319795" : "gray.100" }}
                boxShadow={selectedChat === chat ? "md" : "sm"}
                transition="background 0.2s"
              >
                <Box mr={3}>
                  <Avatar
                    size="sm"
                    name={chat.isGroupChat ? chat.chatName : getSender(loggedUser, chat.users)}
                    src={chat.isGroupChat ? undefined : chat.users.find(u => u._id !== loggedUser?._id)?.pic}
                  />
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" noOfLines={1}>
                    {chat.isGroupChat ? chat.chatName : getSender(loggedUser, chat.users)}
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      <b>{chat.latestMessage.sender.name}:</b> {chat.latestMessage.content.length > 50 ? chat.latestMessage.content.substring(0, 51) + "..." : chat.latestMessage.content}
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
