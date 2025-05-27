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
      // minH="100vh"
      bg="white"
      py={12}
      px={4}
      textColor={"black"}
    >
      <Container 
        maxW="lg" 
        py={{ base: '12', md: '24' }} 
        px={{ base: '0', sm: '8' }}
      >
        <Box
          bg="white"
          py="8"
          px={{ base: '4', md: '10' }}
          shadow="xl"
          rounded="xl"
          border="1px solid"
          borderColor="white"
        >
          <VStack spacing="6">
            <Box textAlign="center" w="full">
              <Heading 
                size="lg" 
                fontWeight="bold" 
                mb="2"
                color="gray.800"
              >
                Welcome back
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Sign in to your account
              </Text>
            </Box>

            <VStack spacing="5" w="90%" alignItems="left">
              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="medium">Email Address</FormLabel>
                <Input
                  size="lg"
                  type="email"
                  placeholder="Enter Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="white"
                  color="black"
                  width="100%"
                  borderColor="gray.500"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="medium">Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={show ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="white"
                    color="black"
                    width="80%"
                    borderColor="gray.500"
                    _hover={{ borderColor: "gray.400" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={handleClick}
                      variant="ghost"
                      color="gray.600"
                      _hover={{ color: "gray.800" }}
                    >
                      {show ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>

            <VStack spacing="4" w="full">
              <Button
                w="full"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                py={6}
                onClick={submitHandler}
                isLoading={loading}
                loadingText="Signing in"
                boxShadow="md"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                transition="all 0.2s"
              >
                Sign in
              </Button>

              <Button
                w="full"
                variant="outline"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                py={6}
                onClick={() => {
                  setEmail("guest@example.com");
                  setPassword("123456");
                }}
                boxShadow="sm"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                }}
                transition="all 0.2s"
              >
                Use Guest Credentials
              </Button>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
