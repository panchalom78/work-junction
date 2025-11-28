// components/ServiceAgentChat.jsx
import React, { useState, useEffect, useRef } from "react";
import {
    Search,
    MessageCircle,
    Users,
    Clock,
    Filter,
    Send,
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    Shield,
    Star,
    Menu,
    X,
} from "lucide-react";

const ServiceAgentChat = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch agent chats
    const fetchAgentChats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/service-agent/chats?search=${searchTerm}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setChats(data.data.chats);
            }
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/service-agent/dashboard/stats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Fetch chat messages
    const fetchChatMessages = async (chatId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/service-agent/chats/${chatId}/messages`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setMessages(data.data.messages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/service-agent/chats/${selectedChat.chatId}/messages`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: newMessage,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, data.data.message]);
                setNewMessage("");

                // Refresh chats to update last message
                fetchAgentChats();

                // Close sidebar on mobile after sending message
                if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Handle chat selection
    const handleChatSelect = async (chat) => {
        setSelectedChat(chat);
        await fetchChatMessages(chat.chatId);

        // Close sidebar on mobile when chat is selected
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        handleResize(); // Set initial state
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchAgentChats();
        fetchDashboardStats();
    }, [searchTerm]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (timestamp) => {
        const now = new Date();
        const messageDate = new Date(timestamp);
        const diffTime = now.getTime() - messageDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Today";
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return messageDate.toLocaleDateString("en-US", {
                weekday: "short",
            });
        } else {
            return messageDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }
    };

    // Mobile sidebar toggle
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50 relative">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20 p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            {sidebarOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">
                                Agent Chat
                            </h1>
                            <p className="text-xs text-gray-600">
                                {selectedChat
                                    ? `Chatting with ${selectedChat.customer.name}`
                                    : "Manage conversations"}
                            </p>
                        </div>
                    </div>
                    {selectedChat && (
                        <button
                            onClick={() => setSelectedChat(null)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }
                fixed lg:relative z-40 lg:z-auto
                w-80 lg:w-96 xl:w-80 2xl:w-96
                bg-white border-r border-gray-200 flex flex-col
                transition-transform duration-300 ease-in-out
                h-full lg:h-auto
                mt-14 lg:mt-0
            `}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 lg:block hidden">
                    <h1 className="text-xl font-bold text-gray-900">
                        Agent Chat
                    </h1>
                    <p className="text-sm text-gray-600">
                        Manage worker conversations
                    </p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="p-3 sm:p-4 bg-blue-50 border-b border-blue-100">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                            <div className="text-center p-2 bg-white rounded-lg">
                                <div className="text-base sm:text-lg font-bold text-blue-700">
                                    {stats.totalChats}
                                </div>
                                <div className="text-xs text-blue-600">
                                    Total Chats
                                </div>
                            </div>
                            <div className="text-center p-2 bg-white rounded-lg">
                                <div className="text-base sm:text-lg font-bold text-green-700">
                                    {stats.activeChats}
                                </div>
                                <div className="text-xs text-green-600">
                                    Active
                                </div>
                            </div>
                            <div className="text-center p-2 bg-white rounded-lg">
                                <div className="text-base sm:text-lg font-bold text-purple-700">
                                    {stats.totalWorkers}
                                </div>
                                <div className="text-xs text-purple-600">
                                    Workers
                                </div>
                            </div>
                            <div className="text-center p-2 bg-white rounded-lg">
                                <div className="text-base sm:text-lg font-bold text-orange-700">
                                    {stats.totalMessages}
                                </div>
                                <div className="text-xs text-orange-600">
                                    Messages
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="p-3 sm:p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                            <div>Loading chats...</div>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <div className="text-sm">No chats found</div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-blue-600 text-xs mt-2 hover:underline"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => handleChatSelect(chat)}
                                className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                                    selectedChat?._id === chat._id
                                        ? "bg-blue-50 border-blue-200"
                                        : ""
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                                            {chat.customer.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                                            With {chat.worker.name}
                                        </p>
                                    </div>
                                    {chat.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>

                                {chat.lastMessage && (
                                    <p className="text-xs sm:text-sm text-gray-500 truncate mb-1">
                                        {chat.lastMessage.content}
                                    </p>
                                )}

                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span>
                                        {formatDate(chat.lastMessageAt)}
                                    </span>
                                    <span>
                                        {formatTime(chat.lastMessageAt)}
                                    </span>
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
                mt-14 lg:mt-0
                ${!selectedChat ? "lg:flex" : "flex"}
            `}
            >
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            setSelectedChat(null);
                                            if (window.innerWidth < 1024) {
                                                setSidebarOpen(true);
                                            }
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {selectedChat.customer.name.charAt(
                                                0
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                                {selectedChat.customer.name}
                                            </h2>
                                            <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                                                <Briefcase className="w-3 h-3 mr-1" />
                                                Chatting as{" "}
                                                {selectedChat.worker.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm">
                                        {selectedChat.customer.phone}
                                    </span>
                                </div>
                            </div>

                            {/* Mobile customer info */}
                            <div className="sm:hidden mt-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center space-x-4 text-xs text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Phone className="w-3 h-3" />
                                        <span>
                                            {selectedChat.customer.phone}
                                        </span>
                                    </div>
                                    {selectedChat.customer.email && (
                                        <div className="flex items-center space-x-1">
                                            <Mail className="w-3 h-3" />
                                            <span className="truncate max-w-24">
                                                {selectedChat.customer.email}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 pb-20 sm:pb-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                                    <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        No messages yet
                                    </h3>
                                    <p className="text-sm text-center max-w-xs">
                                        Start the conversation by sending a
                                        message to {selectedChat.customer.name}
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.messageId}
                                        className={`flex ${
                                            message.senderId ===
                                            selectedChat.worker._id
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[85%] xs:max-w-xs sm:max-w-md px-3 sm:px-4 py-2 rounded-2xl ${
                                                message.senderId ===
                                                selectedChat.worker._id
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200 text-gray-900"
                                            }`}
                                        >
                                            <p className="text-sm break-words">
                                                {message.content}
                                            </p>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    message.senderId ===
                                                    selectedChat.worker._id
                                                        ? "text-blue-100"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="fixed bottom-0 left-0 right-0 lg:relative bg-white border-t border-gray-200 p-3 sm:p-4">
                            <div className="flex space-x-2 sm:space-x-4">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && sendMessage()
                                    }
                                    placeholder="Type a message..."
                                    className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="bg-blue-600 text-white p-2 sm:px-4 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-12 sm:min-w-20"
                                >
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline ml-1">
                                        Send
                                    </span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center max-w-sm">
                            <MessageCircle className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                                Welcome to Agent Chat
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-6">
                                Select a conversation from the sidebar to start
                                messaging with customers on behalf of your
                                workers.
                            </p>
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Open Chats
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceAgentChat;
