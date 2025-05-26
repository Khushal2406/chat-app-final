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
      bg="gray.800"
      w="31%"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.700"
      boxShadow="lg"
      h="calc(100vh - 100px)"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ boxShadow: "xl" }}
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
        borderBottom="1px"
        borderColor="gray.700"
      >
        <Text fontWeight="bold" color="white">My Chats</Text>
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
            _hover={{ transform: "scale(1.05)", bg: "blue.500" }}
            transition="all 0.2s ease"
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="gray.900"
        w="100%"
        h="calc(100% - 60px)"
        borderRadius="lg"
        overflowY="auto"
        boxShadow="xs"
      >
        {chats ? (
          <Stack spacing={3}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "blue.600" : "gray.800"}
                color={selectedChat === chat ? "white" : "gray.200"}
                px={4}
                py={3}
                borderRadius="lg"
                key={chat._id}
                d="flex"
                alignItems="center"
                _hover={{ 
                  bg: selectedChat === chat ? "blue.500" : "gray.700",
                  transform: "translateY(-2px)",
                  boxShadow: "md"
                }}
                boxShadow={selectedChat === chat ? "md" : "sm"}
                transition="all 0.2s ease"
              >
                <Box mr={3}>
                  <Avatar
                    size="sm"
                    name={chat.isGroupChat ? chat.chatName : getSender(loggedUser, chat.users)}
                    src={chat.isGroupChat ? undefined : chat.users.find(u => u._id !== loggedUser?._id)?.pic}
                    boxShadow="md"
                  />
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" noOfLines={1} fontSize="sm">
                    {chat.isGroupChat ? chat.chatName : getSender(loggedUser, chat.users)}
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs" color={selectedChat === chat ? "white" : "gray.400"} noOfLines={1}>
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
