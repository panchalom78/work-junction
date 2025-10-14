// pages/WorkerChat.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Send,
    User,
    Clock,
    Phone,
    MoreVertical,
    Image,
    Paperclip,
    MessageCircle,
} from "lucide-react";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "../store/auth.store";

const WorkerChat = () => {
    const { chatId, customerId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [messageInput, setMessageInput] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const {
        chats,
        currentChat,
        messages,
        loading,
        error,
        getWorkerChats,
        getOrCreateChat,
        sendMessage,
        getChatMessages,
        setCurrentChat,
        clearCurrentChat,
    } = useChatStore();

    const { user, getUser } = useAuthStore();

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        getUser();
    }, []);

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Always load worker's chats first
                await getWorkerChats();

                if (customerId) {
                    // Creating new chat with customer
                    console.log("Creating new chat with customer:", customerId);
                    await getOrCreateChat(customerId);
                } else if (chatId) {
                    // Loading existing chat
                    console.log("Loading existing chat:", chatId);
                    await getChatMessages(chatId);

                    // Find and set the current chat from chats list
                    const chat = chats.find((c) => c._id === chatId);
                    if (chat) {
                        setCurrentChat(chat);
                    }
                }
            } catch (error) {
                console.error("Error loading chat data:", error);
            }
        };

        loadInitialData();
    }, [chatId, customerId]);

    // Load messages when currentChat changes
    useEffect(() => {
        if (currentChat && currentChat._id) {
            getChatMessages(currentChat._id);
        }
    }, [currentChat?._id]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle sending message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !currentChat) return;

        try {
            await sendMessage(currentChat._id, messageInput.trim());
            setMessageInput("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Handle chat selection
    const handleChatSelect = async (chat) => {
        navigate(`/worker/chat/${chat._id}`);
        setCurrentChat(chat);
        await getChatMessages(chat._id);
    };

    // Handle back to chats list
    const handleBackToChats = () => {
        navigate("/worker/chat");
        clearCurrentChat();
    };

    // Format time
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Format date for last message
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // If less than 1 minute ago
        if (diffMinutes < 1) return "Just now";

        // If less than 1 hour ago
        if (diffMinutes < 60) return `${diffMinutes}m ago`;

        // If less than 24 hours ago
        if (diffHours < 24) return `${diffHours}h ago`;

        // If yesterday
        if (diffDays === 1) return "Yesterday";

        // If less than 7 days ago
        if (diffDays < 7) return `${diffDays}d ago`;

        // If less than 30 days ago
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

        // Otherwise return full date
        return date.toLocaleDateString();
    };

    // Get customer name from chat (for worker perspective)
    const getCustomerName = (chat) => {
        return chat.participant?.name || "Customer";
    };

    // Get customer phone from chat
    const getCustomerPhone = (chat) => {
        return chat.participant?.phone || "";
    };

    // Get last message preview
    const getLastMessage = (chat) => {
        return chat?.lastMessage.content || "No messages yet";
    };

    // Check if message is from current user
    const isMyMessage = (message) => {
        return message.senderId === user._id;
    };

    return (
        <div className="">
            {/* Main Content */}
            <main className="lg:ml-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex h-[calc(100vh-140px)]">
                            {/* Chat List Sidebar */}
                            <div
                                className={`w-full md:w-80 border-r border-gray-200 ${
                                    currentChat ? "hidden md:block" : "block"
                                }`}
                            >
                                <div className="p-4 border-b border-gray-200 bg-white">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Messages
                                        </h2>
                                        <MessageCircle className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="overflow-y-auto h-full bg-gray-50">
                                    {loading && chats.length === 0 ? (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : chats.length === 0 ? (
                                        <div className="text-center py-8 px-4">
                                            <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                No conversations yet
                                            </h3>
                                            <p className="text-gray-500 text-sm">
                                                Your chat history with customers
                                                will appear here
                                            </p>
                                        </div>
                                    ) : (
                                        chats.map((chat) => (
                                            <div
                                                key={chat._id}
                                                className={`p-4 border-b border-gray-100 hover:bg-white cursor-pointer transition-colors ${
                                                    currentChat?._id ===
                                                    chat._id
                                                        ? "bg-blue-50 border-blue-200"
                                                        : "bg-white"
                                                }`}
                                                onClick={() =>
                                                    handleChatSelect(chat)
                                                }
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <User className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                                {getCustomerName(
                                                                    chat
                                                                )}
                                                            </h3>
                                                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                                {chat.lastMessageAt
                                                                    ? formatDate(
                                                                          chat.lastMessageAt
                                                                      )
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {getLastMessage(
                                                                chat
                                                            )}
                                                        </p>
                                                        {getCustomerPhone(
                                                            chat
                                                        ) && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {getCustomerPhone(
                                                                    chat
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div
                                className={`flex-1 flex flex-col ${
                                    !currentChat ? "hidden md:flex" : "flex"
                                }`}
                            >
                                {currentChat ? (
                                    <>
                                        {/* Fixed Chat Header */}
                                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={handleBackToChats}
                                                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                        {getCustomerName(
                                                            currentChat
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {getCustomerPhone(
                                                            currentChat
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Call customer"
                                                >
                                                    <Phone className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Messages Area with adjusted height */}
                                        <div className="overflow-y-auto bg-gray-50">
                                            <div className="p-4">
                                                {loading &&
                                                messages.length === 0 ? (
                                                    <div className="flex justify-center items-center h-32">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                    </div>
                                                ) : messages.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                            No messages yet
                                                        </h3>
                                                        <p className="text-gray-500">
                                                            Start a conversation
                                                            with{" "}
                                                            {getCustomerName(
                                                                currentChat
                                                            )}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {messages.map(
                                                            (
                                                                message,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        message._id ||
                                                                        index
                                                                    }
                                                                    className={`flex ${
                                                                        isMyMessage(
                                                                            message
                                                                        )
                                                                            ? "justify-end"
                                                                            : "justify-start"
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                                                            isMyMessage(
                                                                                message
                                                                            )
                                                                                ? "bg-blue-600 text-white rounded-br-none"
                                                                                : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                                                                        }`}
                                                                    >
                                                                        <p className="text-sm break-words">
                                                                            {
                                                                                message.content
                                                                            }
                                                                        </p>
                                                                        <p
                                                                            className={`text-xs mt-1 ${
                                                                                isMyMessage(
                                                                                    message
                                                                                )
                                                                                    ? "text-blue-100"
                                                                                    : "text-gray-500"
                                                                            }`}
                                                                        >
                                                                            {formatTime(
                                                                                message.timestamp
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                        {/* <div
                                                            ref={messagesEndRef}
                                                        /> */}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Fixed Message Input */}
                                        <div className="p-4 border-t border-gray-200 bg-white sticky max-h-fit bottom-0">
                                            <form
                                                onSubmit={handleSendMessage}
                                                className="flex items-center space-x-3"
                                            >
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={messageInput}
                                                        onChange={(e) =>
                                                            setMessageInput(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Type your message..."
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        !messageInput.trim() ||
                                                        loading
                                                    }
                                                    className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 flex-shrink-0"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    <span className="hidden sm:inline">
                                                        Send
                                                    </span>
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    // Empty State when no chat is selected
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
                                        <MessageCircle className="w-24 h-24 text-gray-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-500 mb-2">
                                            Select a conversation
                                        </h3>
                                        <p className="text-gray-400 text-center max-w-md">
                                            Choose a chat from the sidebar to
                                            start messaging with your customers
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default WorkerChat;
