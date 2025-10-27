// components/CustomerChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "../store/auth.store";
import {
    Send,
    ArrowLeft,
    Search,
    User,
    Clock,
    MessageCircle,
    Phone,
    MapPin,
    Star,
} from "lucide-react";

const CustomerChatPage = () => {
    const navigate = useNavigate();
    const {
        chats,
        currentChat,
        messages,
        loading,
        error,
        getUserChats,
        getOrCreateChatWithWorker,
        sendMessage,
        getChatMessages,
        setCurrentChat,
        clearCurrentChat,
        addMessage,
        markMessagesAsRead,
    } = useChatStore();

    const { user, getUser } = useAuthStore();
    const [messageInput, setMessageInput] = useState("");
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef(null);

    // Load user chats on component mount
    useEffect(() => {
        loadChats();
        getUser();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mark messages as read when chat is opened
    useEffect(() => {
        if (currentChat) {
            markMessagesAsRead(currentChat._id);
        }
    }, [currentChat, markMessagesAsRead]);

    const loadChats = async () => {
        try {
            await getUserChats();
        } catch (error) {
            console.error("Failed to load chats:", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSelectChat = async (chat) => {
        setSelectedChat(chat);
        setCurrentChat(chat);
        try {
            await getChatMessages(chat._id);
        } catch (error) {
            console.error("Failed to load messages:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !currentChat) return;

        try {
            await sendMessage(currentChat._id, messageInput);
            setMessageInput("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };

    const isToday = (timestamp) => {
        const today = new Date();
        const messageDate = new Date(timestamp);
        return today.toDateString() === messageDate.toDateString();
    };

    const filteredChats = chats.filter((chat) =>
        chat.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getWorkerInfo = (chat) => {
        return chat.participant;
    };

    if (!user || user.role !== "CUSTOMER") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Only customers can access this page.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate("/customer")}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Messages
                                </h1>
                                <p className="text-gray-600">
                                    Chat with your service professionals
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat List Sidebar */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-4">
                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Chat List */}
                        <div className="space-y-2">
                            {filteredChats.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        {loading
                                            ? "Loading conversations..."
                                            : "No conversations yet"}
                                    </p>
                                    <button
                                        onClick={() =>
                                            navigate("/customer/search")
                                        }
                                        className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Find professionals to chat with
                                    </button>
                                </div>
                            ) : (
                                filteredChats.map((chat) => {
                                    const worker = getWorkerInfo(chat);
                                    const isActive =
                                        currentChat?._id === chat._id;

                                    return (
                                        <div
                                            key={chat._id}
                                            onClick={() =>
                                                handleSelectChat(chat)
                                            }
                                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                                                isActive
                                                    ? "bg-blue-50 border border-blue-200"
                                                    : "bg-gray-50 hover:bg-gray-100"
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {worker?.name
                                                            ?.charAt(0)
                                                            .toUpperCase() ||
                                                            "W"}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {worker?.name ||
                                                                "Worker"}
                                                        </h3>
                                                        <span className="text-xs text-gray-500">
                                                            {chat.lastMessageAt
                                                                ? isToday(
                                                                      chat.lastMessageAt
                                                                  )
                                                                    ? formatTime(
                                                                          chat.lastMessageAt
                                                                      )
                                                                    : formatDate(
                                                                          chat.lastMessageAt
                                                                      )
                                                                : ""}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {chat.lastMessage
                                                            ? chat.lastMessage
                                                                  .content
                                                            : "No messages yet"}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <MapPin className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            {worker?.location ||
                                                                "Location not specified"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-4">
                        {!currentChat ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Select a conversation
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Choose a professional from the list to
                                        start chatting
                                    </p>
                                    <button
                                        onClick={() =>
                                            navigate("/customer/search")
                                        }
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Find Professionals
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                {/* Chat Header */}
                                <div className="border-b border-gray-200 pb-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {getWorkerInfo(currentChat)
                                                    ?.name?.charAt(0)
                                                    .toUpperCase() || "W"}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {getWorkerInfo(currentChat)
                                                        ?.name || "Worker"}
                                                </h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>
                                                            {getWorkerInfo(
                                                                currentChat
                                                            )?.location ||
                                                                "Location not specified"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="w-3 h-3 text-yellow-500" />
                                                        <span>4.8</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                                                <Phone className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 p-2">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">
                                                No messages yet. Start the
                                                conversation!
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((message, index) => {
                                            const isCustomer =
                                                message.senderId === user._id;
                                            const showDate =
                                                index === 0 ||
                                                new Date(
                                                    message.timestamp
                                                ).toDateString() !==
                                                    new Date(
                                                        messages[
                                                            index - 1
                                                        ].timestamp
                                                    ).toDateString();

                                            return (
                                                <div key={message._id || index}>
                                                    {showDate && (
                                                        <div className="text-center my-4">
                                                            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                                {isToday(
                                                                    message.timestamp
                                                                )
                                                                    ? "Today"
                                                                    : formatDate(
                                                                          message.timestamp
                                                                      )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`flex ${
                                                            isCustomer
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                                                isCustomer
                                                                    ? "bg-blue-600 text-white rounded-br-none"
                                                                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                                                            }`}
                                                        >
                                                            <p className="text-sm">
                                                                {
                                                                    message.content
                                                                }
                                                            </p>
                                                            <p
                                                                className={`text-xs mt-1 ${
                                                                    isCustomer
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
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form
                                    onSubmit={handleSendMessage}
                                    className="border-t border-gray-200 pt-4 mt-4"
                                >
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) =>
                                                setMessageInput(e.target.value)
                                            }
                                            placeholder="Type your message..."
                                            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                            disabled={loading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={
                                                !messageInput.trim() || loading
                                            }
                                            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerChatPage;
