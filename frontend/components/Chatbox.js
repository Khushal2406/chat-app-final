"use client";

import { Box, Flex, Text } from "@chakra-ui/layout";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      d="flex"
      alignItems="center"
      flexDir="column"
      p={3}
      bg="gray.800"
      w="68%"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.700"
      boxShadow="lg"
      h="calc(100vh - 100px)"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ boxShadow: "xl" }}
    >
      {selectedChat ? (
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      ) : (
        <Flex 
          w="100%" 
          h="100%" 
          align="center" 
          justify="center" 
          bgGradient="linear(to-br, gray.800, gray.700)" 
          borderRadius="lg"
          direction="column"
          gap={4}
        >
          <Text fontSize="3xl" color="white" fontWeight="bold" textAlign="center">
            Welcome to Chat
          </Text>
          <Text fontSize="xl" color="gray.300" textAlign="center">
            Click on a user to start chatting
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default Chatbox;
