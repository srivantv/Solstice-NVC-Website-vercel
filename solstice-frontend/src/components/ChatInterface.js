import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Input, VStack, Text, HStack } from "@chakra-ui/react";
import axios from "axios";

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Replace with your OpenAI API key
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const USE_OPENAI_API = true; // Toggle to use OpenAI API or local server

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!message) return;

    setLoading(true);
    const newUserMessage = { role: "user", content: message };
    const updatedChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedChatHistory);

    try {
      let response;
      if (USE_OPENAI_API) {
        // Convert chat history for OpenAI API format
        response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            messages: updatedChatHistory,
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        const botMessage = {
          role: "assistant",
          content: response.data.choices[0].message.content,
        };
        setChatHistory((prev) => [...prev, botMessage]);
      } else {
        // Call local API server
        response = await axios.post("http://localhost:8000/api/chat/", {
          message,
        });
        const botMessage = {
          role: "assistant",
          content: response.data.response,
        };
        setChatHistory((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  // Auto-scroll to the bottom when a new message is added
  useEffect(() => {
    chatContainerRef.current?.scrollTo(
      0,
      chatContainerRef.current.scrollHeight
    );
  }, [chatHistory]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      h="90vh"
      p={5}
      bg="gray.50"
    >
      {/* Chat window */}
      <Box
        ref={chatContainerRef}
        flex="1"
        overflowY="auto"
        bg="white"
        p={4}
        borderRadius="md"
        boxShadow="md"
      >
        <VStack spacing={4} align="stretch">
          {chatHistory.map((chat, index) => (
            <Box
              key={index}
              alignSelf={chat.role === "assistant" ? "flex-start" : "flex-end"}
              maxW="70%" // Limit message width
            >
              <Box
                bg={chat.role === "assistant" ? "blue.100" : "green.100"}
                p={3}
                borderRadius="md"
                boxShadow="sm"
              >
                <Text fontWeight="bold">
                  {chat.role === "assistant" ? "Bot" : "You"}
                </Text>
                <Text>{chat.content}</Text>
              </Box>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Input and send button */}
      <HStack mt={4} spacing={4}>
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          isDisabled={loading}
        />
        <Button
          onClick={handleSendMessage}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyDown}
          isLoading={loading}
        >
          Send
        </Button>
      </HStack>
    </Box>
  );
};

export default ChatInterface;
