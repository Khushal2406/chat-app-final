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
      bg="white"
      w="68%"
      borderRadius="lg"
      borderWidth="1px"
      boxShadow="md"
      minH="80vh"
    >
      {selectedChat ? (
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      ) : (
        <Flex w="100%" h="100%" align="center" justify="center" bgGradient="linear(to-br, blue.50, white)" borderRadius="lg">
          <Text fontSize="2xl" color="gray.400" fontWeight="semibold" textAlign="center">
            Click on a user to start chatting
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default Chatbox;
