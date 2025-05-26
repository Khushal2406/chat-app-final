"use client";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box, Container, VStack, Heading, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { ChatState } from "../../context/ChatProvider";
import api from "../../src/config/api";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", { email });
      const { data } = await api.post(
        "/user/login",
        { email, password }
      );
      console.log("Login response:", data);

      if (!data || !data.token) {
        throw new Error("Invalid response from server");
      }

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      // Save user data
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Force a small delay before navigation
      setTimeout(() => {
        console.log("Redirecting to /chats");
        router.push("/chats");
      }, 100);

    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || error.message || "Failed to login",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="gray.900"
      py={12}
      px={4}
      textColor="white"
      minH="100vh"
    >
      <Container 
        maxW="lg" 
        py={{ base: '12', md: '24' }} 
        px={{ base: '0', sm: '8' }}
      >
        <Box
          bg="gray.800"
          py="8"
          px={{ base: '4', md: '10' }}
          shadow="xl"
          rounded="xl"
          border="1px solid"
          borderColor="gray.700"
        >
          <VStack spacing="6">
            <Box textAlign="center" w="full">
              <Heading 
                size="lg" 
                fontWeight="bold" 
                mb="2"
                color="white"
              >
                Welcome back
              </Heading>
              <Text color="gray.400" fontSize="lg">
                Sign in to your account
              </Text>
            </Box>

            <FormControl isRequired>
              <FormLabel color="gray.300" fontWeight="medium">Email Address</FormLabel>
              <Input
                size="lg"
                type="email"
                placeholder="Enter Your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="gray.700"
                color="white"
                width="100%"
                borderColor="gray.600"
                _hover={{ borderColor: "gray.500" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="gray.300" fontWeight="medium">Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="gray.700"
                  color="white"
                  width="80%"
                  borderColor="gray.600"
                  _hover={{ borderColor: "gray.500" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  _placeholder={{ color: "gray.400" }}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={handleClick}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: "white", bg: "gray.600" }}
                  >
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              colorScheme="blue"
              width="100%"
              style={{ marginTop: 15 }}
              onClick={submitHandler}
              isLoading={loading}
            >
              Sign In
            </Button>
            <Button
              variant="solid"
              colorScheme="red"
              width="100%"
              onClick={() => {
                setEmail("guest@example.com");
                setPassword("123456");
              }}
            >
              Get Guest User Credentials
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
