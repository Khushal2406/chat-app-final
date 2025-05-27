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

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const messagesEndRef = useRef(null);
  const [translatedMessages, setTranslatedMessages] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to translate a message
  const translateMessage = async (messageId, content) => {
    if (!user?.preferredLanguage || user.preferredLanguage === "default") {
      return content;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await api.post(
        "/translate",
        {
          text: content,
          targetLanguage: user.preferredLanguage,
        },
        config
      );

      return data.translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return content;
    }
  };

  // Translate messages when they change or when language changes
  useEffect(() => {
    const translateMessages = async () => {
      const newTranslatedMessages = {};
      
      for (const message of messages) {
        if (!translatedMessages[message._id]) {
          const translatedText = await translateMessage(message._id, message.content);
          newTranslatedMessages[message._id] = translatedText;
        }
      }

      setTranslatedMessages(prev => ({
        ...prev,
        ...newTranslatedMessages
      }));
    };

    translateMessages();
  }, [messages, user?.preferredLanguage]);

  return (
    <div 
      style={{ 
        overflowY: "auto", 
        height: "calc(100vh - 200px)", // Adjust this value based on your header/footer height
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
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
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                wordBreak: "break-word"
              }}
            >
              {translatedMessages[m._id] || m.content}
            </span>
          </div>
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ScrollableChat;
