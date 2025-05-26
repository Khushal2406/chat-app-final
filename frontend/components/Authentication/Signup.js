"use client";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box, Container, VStack, Heading, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import api from '../../src/config/api';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');
  const [password, setPassword] = useState('');
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordClick = () => setShowPassword(!showPassword);
  const handleConfirmPasswordClick = () => setShowConfirmPassword(!showConfirmPassword);

  const submitHandler = async () => {
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post(
        "/user",
        { name, email, password, pic }
      );
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      router.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const postDetails = (pics) => {
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
      fetch("https://api.cloudinary.com/v1_1/dy50tcztl/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          toast({
            title: "Image uploaded successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "bottom",
          });
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: "Error uploading image",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        })
        .finally(() => {
          setPicLoading(false);
        });
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
    <Box
      bg="gray.900"
      py={12}
      px={4}
      textColor="white"
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
          border="1px"
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
                Create your account
              </Heading>
              <Text color="gray.400" fontSize="lg">
                Join our community today
              </Text>
            </Box>

            <VStack spacing="5" w="90%" alignItems="left">
              <FormControl isRequired>
                <FormLabel color="gray.300" fontWeight="medium">Name</FormLabel>
                <Input
                  size="lg"
                  type="text"
                  placeholder="Enter Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  width="100%"
                  color="white"
                  _hover={{ borderColor: "gray.500" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300" fontWeight="medium">Email Address</FormLabel>
                <Input
                  size="lg"
                  type="email"
                  placeholder="Enter Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="gray.700"
                  width="100%"
                  color="white"
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="gray.700"
                    width="80%"
                    color="white"
                    borderColor="gray.600"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                    _placeholder={{ color: "gray.400" }}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={handlePasswordClick}
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "white", bg: "gray.600" }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300" fontWeight="medium">Confirm Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmpassword}
                    onChange={(e) => setConfirmpassword(e.target.value)}
                    bg="gray.700"
                    width="80%"
                    color="white"
                    borderColor="gray.600"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                    _placeholder={{ color: "gray.400" }}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={handleConfirmPasswordClick}
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "white", bg: "gray.600" }}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300" fontWeight="medium">Profile Picture</FormLabel>
                <Input
                  size="lg"
                  type="file"
                  accept="image/*"
                  onChange={(e) => postDetails(e.target.files[0])}
                  p={2}
                  bg="gray.700"
                  borderColor="gray.600"
                  _hover={{ borderColor: "gray.500" }}
                  sx={{
                    '::file-selector-button': {
                      height: '2.5rem',
                      padding: '0 1rem',
                      background: 'gray.600',
                      border: 'none',
                      borderRadius: 'md',
                      marginRight: '1rem',
                      color: 'white',
                      cursor: 'pointer',
                      _hover: { bg: 'gray.500' }
                    }
                  }}
                />
              </FormControl>
            </VStack>

            <Button
              w="full"
              colorScheme="blue"
              size="lg"
              fontSize="md"
              py={6}
              onClick={submitHandler}
              isLoading={picLoading || isSubmitting}
              loadingText="Creating Account"
              boxShadow="md"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Create Account
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Signup;
