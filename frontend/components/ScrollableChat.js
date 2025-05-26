"use client";

import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { useEffect, useRef, useState } from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../context/ChatProvider";
import api from "../src/config/api";
import { Box } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const messagesEndRef = useRef(null);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to translate multiple messages in batch
  const translateMessages = async (messagesToTranslate) => {
    if (!user?.preferredLanguage || user.preferredLanguage === "default") {
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Prepare texts for batch translation
      const texts = messagesToTranslate.map(msg => msg.content);
      
      const { data } = await api.post(
        "/translate/batch",
        {
          texts,
          targetLanguage: user.preferredLanguage,
        },
        config
      );

      // Update translations state with new translations
      const newTranslations = {};
      messagesToTranslate.forEach((msg, index) => {
        newTranslations[msg._id] = data.translations[index];
      });

      setTranslatedMessages(prev => ({
        ...prev,
        ...newTranslations
      }));
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Translate messages when they change or when language changes
  useEffect(() => {
    if (!messages?.length || !user?.preferredLanguage || user.preferredLanguage === "default") {
      return;
    }

    // Find messages that need translation
    const messagesToTranslate = messages.filter(
      message => !translatedMessages[message._id]
    );

    if (messagesToTranslate.length > 0 && !isTranslating) {
      setIsTranslating(true);
      translateMessages(messagesToTranslate);
    }
  }, [messages, user?.preferredLanguage]);

  return (
    <Box
      d="flex"
      flexDir="column"
      justifyContent="flex-end"
      p={3}
      bg="gray.900"
      w="100%"
      h="calc(100% - 50px)"
      borderRadius="lg"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'gray.600',
          borderRadius: '24px',
        },
      }}
    >
      {messages &&
        messages.map((m, i) => (
          <div 
            style={{ 
              display: "flex",
              justifyContent: m.sender._id === user._id ? "flex-end" : "flex-start",
              width: "100%",
              marginBottom: "8px"
            }} 
            key={m._id}
          >
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                  boxShadow="md"
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#3182CE" : "#2D3748"
                }`,
                color: "white",
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "8px 16px",
                maxWidth: "75%",
                wordBreak: "break-word",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                fontSize: "14px",
                lineHeight: "1.4",
                transition: "all 0.2s ease",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                }
              }}
            >
              {translatedMessages[m._id] || m.content}
              {isTranslating && !translatedMessages[m._id] && (
                <span style={{ 
                  fontSize: "0.8em", 
                  opacity: 0.7,
                  display: "block",
                  marginTop: "4px",
                  color: "#A0AEC0"
                }}> 
                  (translating...)
                </span>
              )}
            </span>
          </div>
        ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ScrollableChat;
