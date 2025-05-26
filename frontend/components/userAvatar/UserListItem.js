import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="gray.800"
      _hover={{
        background: "gray.700",
        color: "white",
        transform: "translateY(-2px)",
        boxShadow: "md"
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="white"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
      transition="all 0.2s ease"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
        boxShadow="md"
      />
      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs" color="gray.400">
          <b>Email : </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;