"use client";

import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import api from "../../src/config/api";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  // Reset groupChatName when modal opens
  useEffect(() => {
    if (isOpen && selectedChat) {
      setGroupChatName(selectedChat.chatName);
    }
  }, [isOpen, selectedChat]);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await api.get(`/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName || groupChatName.trim() === "") {
      toast({
        title: "Error!",
        description: "Please enter a valid group name",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await api.put(
        `/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName.trim(),
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      toast({
        title: "Success!",
        description: "Group name updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Failed to rename group",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await api.put(
        `/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await api.put(
        `/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  return (
    <>
      <IconButton 
        d={{ base: "flex" }} 
        icon={<ViewIcon />} 
        onClick={onOpen}
        aria-label="Update Group"
        size="sm"
        variant="ghost"
        color="gray.400"
        _hover={{ 
          color: "white",
          bg: "gray.700",
          transform: "scale(1.1)"
        }}
        transition="all 0.2s"
      />

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.800" borderColor="gray.700" boxShadow="xl">
          <ModalHeader fontSize="35px" fontFamily="Work sans" color="white" d="flex" justifyContent="center">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                  admin={selectedChat.groupAdmin}
                />
              ))}
            </Box>
            <FormControl d="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                _placeholder={{ color: "gray.400" }}
                _hover={{ borderColor: "gray.500" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
              />
            </FormControl>
            <Button
              colorScheme="blue"
              onClick={handleRename}
              isLoading={renameloading}
              mb={3}
              w="100%"
              _hover={{ transform: "scale(1.02)" }}
              transition="all 0.2s"
            >
              Update Chat
            </Button>
            
            <FormControl>
              <Input
                placeholder="Add Users eg: John, Piyush, Jane"
                mb={1}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                _placeholder={{ color: "gray.400" }}
                _hover={{ borderColor: "gray.500" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
              />
            </FormControl>
            {loading ? (
              <Spinner size="lg" color="blue.400" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;