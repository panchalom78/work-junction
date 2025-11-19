// components/ChatInitiateButton.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chat.store";
import { MessageCircle } from "lucide-react";

const ChatInitiateButton = ({ workerId, workerName, className = "" }) => {
    const navigate = useNavigate();
    const { getOrCreateChatWithWorker, loading } = useChatStore();
    const [isStartingChat, setIsStartingChat] = useState(false);

    const handleStartChat = async () => {
        if (!workerId) return;

        setIsStartingChat(true);
        try {
            const response = await getOrCreateChatWithWorker(workerId);
            // Navigate to chat page with the created chat
            navigate("/customer/chat");
        } catch (error) {
            console.error("Failed to start chat:", error);
            alert("Failed to start chat. Please try again.");
        } finally {
            setIsStartingChat(false);
        }
    };

    return (
        <button
            onClick={handleStartChat}
            disabled={loading || isStartingChat}
            className={`flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${className}`}
        >
            <MessageCircle className="w-4 h-4" />
            <span>{isStartingChat ? "Starting Chat..." : `Chat`}</span>
        </button>
    );
};

export default ChatInitiateButton;
