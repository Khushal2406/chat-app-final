"use client";

import { ViewIcon, EditIcon } from "@chakra-ui/icons";
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
  IconButton,
  Text,
  Image,
  FormControl,
  Input,
  useToast,
  Spinner,
  Box,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { ChatState } from "../../context/ChatProvider";
import api from "../../src/config/api";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [picLoading, setPicLoading] = useState(false);
  const toast = useToast();
  const { setUser } = ChatState();
  const fileInputRef = useRef(null);

  const postDetails = async (pics) => {
    if (!pics) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      setPicLoading(true);
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app-3");
      data.append("cloud_name", "dy50tcztl");
      try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dy50tcztl/image/upload", {
          method: "post",
          body: data,
        });
        const result = await response.json();
        
        // Update user profile with new picture
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        
        const { data: updatedUser } = await api.put(
          "/user/updatepic",
          { pic: result.url.toString() },
          config
        );

        setUser(updatedUser);
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        
        toast({
          title: "Profile Picture Updated!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error uploading image",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      } finally {
        setPicLoading(false);
      }
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="center">
              <Box position="relative" w="150px" h="150px">
                <Image
                  borderRadius="full"
                  boxSize="150px"
                  src={user.pic}
                  alt={user.name}
                  objectFit="cover"
                />
                <IconButton
                  aria-label="Change profile picture"
                  icon={<EditIcon />}
                  size="sm"
                  colorScheme="blue"
                  position="absolute"
                  bottom="0"
                  right="0"
                  borderRadius="full"
                  onClick={() => fileInputRef.current?.click()}
                  _hover={{ transform: "scale(1.1)" }}
                  transition="all 0.2s"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => postDetails(e.target.files[0])}
                  display="none"
                  ref={fileInputRef}
                />
              </Box>
              <Text
                fontSize={{ base: "28px", md: "30px" }}
                fontFamily="Work sans"
              >
                Email: {user.email}
              </Text>
              {picLoading && (
                <HStack spacing={2}>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.500">Updating profile picture...</Text>
                </HStack>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;