// src/utils/razorpay.js
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const initializeRazorpay = (orderData, callbacks) => {
    const { onSuccess, onError, onClose } = callbacks;

    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Workjunction",
        description: "Service Booking Payment",
        order_id: orderData.orderId,
        handler: async function (response) {
            try {
                await onSuccess(response);
            } catch (error) {
                onError(error);
            }
        },
        prefill: {
            name: localStorage.getItem("userName") || "",
            email: localStorage.getItem("userEmail") || "",
            contact: localStorage.getItem("userPhone") || "",
        },
        notes: {
            bookingId: orderData.bookingId,
        },
        theme: {
            color: "#4F46E5",
        },
        modal: {
            ondismiss: onClose,
        },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
};
