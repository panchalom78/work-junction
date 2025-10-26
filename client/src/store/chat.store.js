// store/chat.store.js
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

export const useChatStore = create((set, get) => ({
    chats: [],
    currentChat: null,
    messages: [],
    loading: false,
    error: null,

    // Get all chats for worker
    getWorkerChats: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/api/chats");
            console.log("Worker chats response:", response.data);

            set({
                chats: response.data.data,
                loading: false,
            });
            return response.data.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch chats",
                loading: false,
            });
            throw error;
        }
    },

    getUserChats: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/api/chats");
            console.log("User chats response:", response.data);

            set({
                chats: response.data.data,
                loading: false,
            });
            return response.data.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch chats",
                loading: false,
            });
            throw error;
        }
    },
    getOrCreateChatWithWorker: async (workerId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(
                `/api/chats/with/${workerId}`
            );
            console.log("Get/create chat with worker response:", response.data);

            set({
                currentChat: response.data.data,
                loading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to get/create chat",
                loading: false,
            });
            throw error;
        }
    },

    // Get or create chat with customer (Worker initiating chat)
    getOrCreateChat: async (customerId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(
                `/api/chats/with/${customerId}`
            );
            console.log("Get/create chat response:", response.data);

            set({
                currentChat: response.data.data,
                loading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to get/create chat",
                loading: false,
            });
            throw error;
        }
    },
    sendMessage: async (chatId, content) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post(
                `/api/chats/${chatId}/messages`,
                { content }
            );

            // Update messages in state
            const { messages } = get();
            set({
                messages: [...messages, response.data.data.message],
                loading: false,
            });

            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to send message",
                loading: false,
            });
            throw error;
        }
    },
    getChatMessages: async (chatId, page = 1, limit = 50) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(
                `/api/chats/${chatId}/messages`,
                { params: { page, limit } }
            );

            set({
                messages: response.data.data.messages,
                loading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to fetch messages",
                loading: false,
            });
            throw error;
        }
    },

    // Set current chat directly (for navigation)
    setCurrentChat: (chat) => {
        set({ currentChat: chat });
    },

    // Clear current chat
    clearCurrentChat: () => {
        set({
            currentChat: null,
            messages: [],
        });
    },

    // Add message to state (for real-time updates)
    addMessage: (message) => {
        const { messages } = get();
        set({ messages: [...messages, message] });
    },

    // Update chat list when new message is sent
    updateChatInList: (updatedChat) => {
        const { chats } = get();
        const updatedChats = chats.map((chat) =>
            chat._id === updatedChat._id ? updatedChat : chat
        );
        set({ chats: updatedChats });
    },

    // Mark messages as read
    markMessagesAsRead: async (chatId) => {
        try {
            await axiosInstance.patch(`/api/chats/${chatId}/read`);
        } catch (error) {
            console.error("Failed to mark messages as read:", error);
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
