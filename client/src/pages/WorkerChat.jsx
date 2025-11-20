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
    Search,
} from "lucide-react";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "../store/auth.store";

const WorkerChat = () => {
    const { chatId, customerId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [messageInput, setMessageInput] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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
        return chat?.lastMessage?.content || "No messages yet";
    };

    // Check if message is from current user
    const isMyMessage = (message) => {
        return message.senderId === user._id;
    };

    // Filter chats based on search query
    const filteredChats = chats.filter(
        (chat) =>
            getCustomerName(chat)
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            getLastMessage(chat)
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen bg-gray-50">
            {/* Main Chat Container */}
            <div className="flex h-full max-w-6xl mx-auto bg-white shadow-sm">
                {/* Chat List Sidebar - Always visible on desktop, conditional on mobile */}
                <div
                    className={`
                    flex flex-col w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white
                    ${currentChat ? "hidden md:flex" : "flex"}
                    transition-all duration-300
                `}
                >
                    {/* Chat List Header */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Messages
                            </h2>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MessageCircle className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && chats.length === 0 ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-8 px-4">
                                <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <h3 className="text-base font-medium text-gray-900 mb-1">
                                    {searchQuery
                                        ? "No matches found"
                                        : "No conversations yet"}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {searchQuery
                                        ? "Try different search terms"
                                        : "Your chat history with customers will appear here"}
                                </p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <div
                                    key={chat._id}
                                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        currentChat?._id === chat._id
                                            ? "bg-gray-50 border-gray-200"
                                            : "bg-white"
                                    }`}
                                    onClick={() => handleChatSelect(chat)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                    {getCustomerName(chat)}
                                                </h3>
                                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                    {chat.lastMessageAt
                                                        ? formatDate(
                                                              chat.lastMessageAt
                                                          )
                                                        : ""}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                {getLastMessage(chat)}
                                            </p>
                                            {getCustomerPhone(chat) && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {getCustomerPhone(chat)}
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
                    className={`
                    flex-1 flex flex-col
                    ${!currentChat ? "hidden md:flex" : "flex"}
                `}
                >
                    {currentChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleBackToChats}
                                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold text-gray-900 truncate">
                                            {getCustomerName(currentChat)}
                                        </h3>
                                        <p className="text-sm text-gray-600 truncate">
                                            {getCustomerPhone(currentChat)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto bg-gray-50">
                                <div className="p-4">
                                    {loading && messages.length === 0 ? (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                            <h3 className="text-base font-medium text-gray-900 mb-2">
                                                No messages yet
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                Start a conversation with{" "}
                                                {getCustomerName(currentChat)}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {messages.map((message, index) => (
                                                <div
                                                    key={message._id || index}
                                                    className={`flex ${
                                                        isMyMessage(message)
                                                            ? "justify-end"
                                                            : "justify-start"
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                            isMyMessage(message)
                                                                ? "bg-gray-900 text-white"
                                                                : "bg-white text-gray-900 border border-gray-200"
                                                        } shadow-sm`}
                                                    >
                                                        <p className="text-sm break-words leading-relaxed">
                                                            {message.content}
                                                        </p>
                                                        <p
                                                            className={`text-xs mt-1 text-right ${
                                                                isMyMessage(
                                                                    message
                                                                )
                                                                    ? "text-gray-400"
                                                                    : "text-gray-500"
                                                            }`}
                                                        >
                                                            {formatTime(
                                                                message.timestamp
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-center space-x-3"
                                >
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) =>
                                                setMessageInput(e.target.value)
                                            }
                                            placeholder="Type a message..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm text-gray-900"
                                            disabled={loading}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={
                                            !messageInput.trim() || loading
                                        }
                                        className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 flex-shrink-0"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        // Empty State when no chat is selected (Desktop only)
                        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 bg-gray-50">
                            <div className="text-center max-w-md">
                                <MessageCircle className="w-24 h-24 text-gray-300 mb-6 mx-auto" />
                                <h3 className="text-lg font-semibold text-gray-500 mb-3">
                                    Welcome to Messages
                                </h3>
                                <p className="text-gray-400 text-base">
                                    Select a conversation from the sidebar to
                                    start messaging with your customers
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default WorkerChat;
