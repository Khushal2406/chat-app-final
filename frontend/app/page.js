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

    if (user) router.push("/chats");
  }, [router]);

  return (
    <Container maxW="100%" centerContent backgroundColor="#1A202C">
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="gray.800"
        w="60%"
        m="40px 0 20px 0"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.700"
        boxShadow="xl"
        transition="all 0.3s ease"
        _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
      >
        <Text 
          fontSize="6xl" 
          fontFamily="Work sans" 
          textAlign="center" 
          color="white"
          bgGradient="linear(to-r, blue.400, blue.600)"
          bgClip="text"
          fontWeight="bold"
        >
          Talk-A-Tive
        </Text>
      </Box>
      <Box 
        bg="gray.800" 
        w="80%" 
        p={4} 
        borderRadius="lg" 
        borderWidth="1px"
        borderColor="gray.700"
        boxShadow="xl"
      >
        <Tabs isFitted variant="soft-rounded" colorScheme="blue">
          <TabList mb="1em" justifyContent="center" gap="10px">
            <Tab 
              fontSize="2xl" 
              fontFamily="Work sans" 
              textAlign="center" 
              color="gray.400"
              _selected={{ 
                color: "white",
                bg: "blue.500",
                boxShadow: "md"
              }}
              _hover={{ 
                color: "white",
                bg: "gray.700"
              }}
              width="50%"
            >
              Login
            </Tab>
            <Tab 
              fontSize="2xl" 
              fontFamily="Work sans" 
              textAlign="center" 
              color="gray.400"
              _selected={{ 
                color: "white",
                bg: "blue.500",
                boxShadow: "md"
              }}
              _hover={{ 
                color: "white",
                bg: "gray.700"
              }}
              width="50%"
            >
              Sign Up
            </Tab>
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
