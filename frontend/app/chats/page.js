"use client";

import { Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import Chatbox from "../../components/Chatbox";
import MyChats from "../../components/MyChats";
import SideDrawer from "../../components/miscellaneous/SideDrawer";
import LanguageSelector from "../../components/LanguageSelector";
import { useRouter } from "next/navigation";

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      toast({
        title: "Error Occurred!",
        description: "Please login to access Chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      router.push("/");
    }
  }, [user, toast, router]);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        as="div"
        display="flex"
        justifyContent="space-between"
        width="100%"
        height="91.5vh"
        padding="10px"
      >
        <Box
          as="div"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
          padding="10px"
        >
          <Box
            as="div"
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding={3}
            bg="white"
            width="100%"
            height="100%"
            borderRadius="lg"
            borderWidth="1px"
          >
            <Box
              as="div"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              marginBottom={4}
            >
              <Box as="div" flex="1" />
              {user && <LanguageSelector />}
            </Box>
            <Box
              as="div"
              display="flex"
              justifyContent="space-between"
              width="100%"
              height="100%"
              padding="10px"
            >
              {user && <MyChats fetchAgain={fetchAgain} />}
              {user && (
                <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default ChatPage;