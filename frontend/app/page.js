"use client";
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) router.push("/chats"); // ✅ updated
  }, [router]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="60%"
        m="40px 0 20px 0"
        borderRadius="10px"
        borderWidth="1px"
      >
        <Text fontSize="6xl" fontFamily="Work sans" textAlign="center" color="black" >
          Talk-A-Tive
        </Text>
      </Box>
      <Box bg="white" w="80%" p={4} borderRadius="8px" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded" alignItems="center">
          <TabList mb="1em" justifyContent="center" gap="10px">
            <Tab fontSize="2xl" fontFamily="Work sans" textAlign="center" color="black" backgroundColor="white" width="50%">Login</Tab>
            <Tab fontSize="2xl" fontFamily="Work sans" textAlign="center" color="black" backgroundColor="white" width="50%">Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
