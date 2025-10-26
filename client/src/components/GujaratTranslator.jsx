// components/RobustGujaratTranslator.js
import React, { useState, useEffect, useRef } from "react";

const RobustGujaratTranslator = () => {
    const [currentLanguage, setCurrentLanguage] = useState("en");
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const scriptLoaded = useRef(false);

    const gujaratLanguages = [
        { code: "en", name: "English", nativeName: "English" },
        { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
        { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
        { code: "mr", name: "Marathi", nativeName: "मराठी" },
        { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
        { code: "ur", name: "Urdu", nativeName: "اردو" },
        { code: "bn", name: "Bengali", nativeName: "বাংলা" },
        { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
    ];

    // Safe Google Translate initialization
    const initializeGoogleTranslate = () => {
        try {
            if (
                window.google &&
                window.google.translate &&
                window.google.translate.TranslateElement
            ) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: gujaratLanguages
                            .map((lang) => lang.code)
                            .join(","),
                        layout: window.google.translate.TranslateElement
                            .InlineLayout.HORIZONTAL,
                        autoDisplay: false,
                    },
                    "google_translate_element"
                );

                setIsInitialized(true);
                setError(null);
                console.log("Google Translate initialized successfully");
            } else {
                throw new Error("Google Translate API not available");
            }
        } catch (err) {
            console.error("Failed to initialize Google Translate:", err);
            setError("Translation service temporarily unavailable");
            setIsInitialized(false);
        }
    };

    // Load Google Translate script safely
    const loadGoogleTranslateScript = () => {
        if (scriptLoaded.current) return;

        return new Promise((resolve, reject) => {
            try {
                const script = document.createElement("script");
                script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
                script.async = true;
                script.onload = () => {
                    scriptLoaded.current = true;
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error("Failed to load Google Translate script"));
                };
                document.head.appendChild(script);
            } catch (err) {
                reject(err);
            }
        });
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            if (mounted) {
                setIsLoading(true);
                setError(null);
            }

            try {
                // Check if already initialized
                if (window.google && window.google.translate) {
                    initializeGoogleTranslate();
                    return;
                }

                // Load the script
                await loadGoogleTranslateScript();

                // Set up initialization callback
                window.googleTranslateElementInit = () => {
                    if (mounted) {
                        initializeGoogleTranslate();
                        setIsLoading(false);
                    }
                };

                // Fallback in case callback doesn't fire
                setTimeout(() => {
                    if (mounted && !isInitialized && window.google) {
                        initializeGoogleTranslate();
                        setIsLoading(false);
                    }
                }, 3000);
            } catch (err) {
                if (mounted) {
                    console.error("Initialization error:", err);
                    setError(
                        "Failed to load translation service. Please check your ad blocker or try refreshing the page."
                    );
                    setIsLoading(false);
                    setIsInitialized(false);
                }
            }
        };

        init();

        return () => {
            mounted = false;
            // Cleanup
            if (window.googleTranslateElementInit) {
                window.googleTranslateElementInit = null;
            }
        };
    }, []);

    const changeLanguage = (languageCode) => {
        if (!isInitialized) {
            setError(
                "Translation service not ready. Please try again in a moment."
            );
            return;
        }

        try {
            const googleSelect = document.querySelector(".goog-te-combo");
            if (googleSelect && googleSelect.value !== languageCode) {
                googleSelect.value = languageCode;
                const event = new Event("change", { bubbles: true });
                googleSelect.dispatchEvent(event);
                setCurrentLanguage(languageCode);
                setError(null);
            }
        } catch (err) {
            console.error("Error changing language:", err);
            setError("Failed to change language. Please try again.");
        }
    };

    const getFlagEmoji = (languageCode) => {
        const flagEmojis = {
            en: "🇺🇸",
            gu: "🇮🇳",
            hi: "🇮🇳",
            mr: "🇮🇳",
            pa: "🇮🇳",
            ur: "🇵🇰",
            bn: "🇧🇩",
            sd: "🇵🇰",
        };
        return flagEmojis[languageCode] || "🌐";
    };

    const currentLang = gujaratLanguages.find(
        (lang) => lang.code === currentLanguage
    );

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm flex items-center">
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm flex items-center">
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Loading translation service...
                    </p>
                </div>
            )}

            {/* Language Selector */}
            <div className="relative">
                <select
                    value={currentLanguage}
                    onChange={(e) => changeLanguage(e.target.value)}
                    disabled={!isInitialized || isLoading}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {gujaratLanguages.map((language) => (
                        <option key={language.code} value={language.code}>
                            <span className="flex items-center">
                                <span className="mr-2 text-lg">
                                    {getFlagEmoji(language.code)}
                                </span>
                                {language.nativeName} - {language.name}
                            </span>
                        </option>
                    ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                    {isInitialized ? (
                        <>
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Translation ready
                        </>
                    ) : (
                        <>
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                            Initializing...
                        </>
                    )}
                </span>
                {currentLang && <span>Selected: {currentLang.nativeName}</span>}
            </div>

            {/* Hidden Google Translate Element */}
            <div id="google_translate_element" className="hidden"></div>
        </div>
    );
};

export default RobustGujaratTranslator;
