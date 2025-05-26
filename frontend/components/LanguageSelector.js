"use client";

import { Select } from "@chakra-ui/react";
import { ChatState } from "../context/ChatProvider";

const LanguageSelector = () => {
  const { user, setUser } = ChatState();

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    const updatedUser = { ...user, preferredLanguage: newLanguage };
    setUser(updatedUser);
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));
  };

  return (
    <Select
      as="select"
      value={user?.preferredLanguage || "default"}
      onChange={handleLanguageChange}
      width="200px"
      marginLeft="10px"
      aria-label="Select language"
      bg="gray.700"
      color="white"
      borderColor="gray.600"
      _hover={{ borderColor: "gray.500" }}
      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
      _placeholder={{ color: "gray.400" }}
      sx={{
        option: {
          bg: "gray.800",
          color: "white",
          _hover: {
            bg: "gray.700"
          }
        }
      }}
    >
      <option value="default">Default</option>
      <option value="en">English</option>
      <option value="it">Italian</option>
      <option value="zh">Chinese</option>
      <option value="fr">French</option>
      <option value="de">German</option>
    </Select>
  );
};

export default LanguageSelector;