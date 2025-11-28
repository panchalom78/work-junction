// components/RobustGujaratTranslator.js
import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "preferredLanguage";
const DEFAULT_LANG = "en";

const gujaratLanguages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
];

/** Polls for the presence of the google translate select (.goog-te-combo).
 *  Resolves with the element if found within timeout, otherwise resolves null.
 */
const waitForGoogleSelect = (timeoutMs = 5000, intervalMs = 250) =>
    new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
            const el = document.querySelector(".goog-te-combo");
            if (el) return resolve(el);
            if (Date.now() - start >= timeoutMs) return resolve(null);
            setTimeout(check, intervalMs);
        };
        check();
    });

/** Try to set google translate dropdown value and dispatch change event.
 *  Returns true if applied, false otherwise.
 */
const tryApplyLanguageToWidget = (languageCode) => {
    try {
        const sel = document.querySelector(".goog-te-combo");
        if (!sel) return false;
        if (sel.value === languageCode) return true;
        sel.value = languageCode;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
    } catch (err) {
        console.warn("applyLanguage error:", err);
        return false;
    }
};

/**
 * Restore page to original English content
 */
const restoreToEnglish = () => {
    try {
        // Remove Google Translate iframe and elements
        const googleFrames = document.querySelectorAll(
            ".goog-te-banner-frame, .goog-te-menu-frame, .skiptranslate"
        );
        googleFrames.forEach((frame) => {
            if (frame.parentNode) {
                frame.parentNode.removeChild(frame);
            }
        });

        // Remove Google Translate styles
        const googleStyles = document.querySelectorAll("style[data-g-style]");
        googleStyles.forEach((style) => {
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        });

        // Restore original body class and style
        document.body.classList.remove("translated-ltr", "translated-rtl");
        document.body.style.top = "0px";
        document.body.style.position = "static";

        // Remove any Google Translate meta tags
        const googleMeta = document.querySelector(
            'meta[name="google-translate-customization"]'
        );
        if (googleMeta && googleMeta.parentNode) {
            googleMeta.parentNode.removeChild(googleMeta);
        }

        console.log("Page restored to English");
        return true;
    } catch (error) {
        console.warn("Error restoring to English:", error);
        return false;
    }
};

/**
 * Public helper: attempt to apply preferred language (from localStorage) to the Google widget.
 * Returns a promise that resolves true if applied, false otherwise.
 */
export const applyPreferredLanguageAsync = async (timeoutMs = 5000) => {
    try {
        const lang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

        // If English, restore original content and return
        if (lang === "en") {
            restoreToEnglish();
            return true;
        }

        console.log(`Applying preferred language: ${lang}`);

        // Wait for widget to be ready with options populated
        const widget = await waitForGoogleSelect(timeoutMs);
        if (!widget) {
            console.warn(
                "Google translate widget did not appear within timeout."
            );
            return false;
        }

        // Additional wait for options to be populated
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            // Check if the desired language option exists and is available
            const optionExists = Array.from(widget.options).some(
                (option) => option.value === lang
            );

            if (optionExists && widget.value !== lang) {
                console.log(`Setting language to: ${lang}`);
                widget.value = lang;

                // Trigger multiple events to ensure Google Translate catches it
                widget.dispatchEvent(new Event("change", { bubbles: true }));
                widget.dispatchEvent(new Event("input", { bubbles: true }));

                // Small delay to let Google process the change
                await new Promise((resolve) => setTimeout(resolve, 100));

                // Verify the change was applied
                if (widget.value === lang) {
                    console.log(`Successfully applied language: ${lang}`);
                    return true;
                }
            } else if (widget.value === lang) {
                console.log(`Language already set to: ${lang}`);
                return true;
            }

            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        console.warn(
            `Failed to apply language ${lang} after ${maxAttempts} attempts`
        );
        return false;
    } catch (error) {
        console.error("Error applying preferred language:", error);
        return false;
    }
};

// convenience global for callers who don't want to import
if (typeof window !== "undefined") {
    window.loadPreferredTranslateLanguage = () =>
        applyPreferredLanguageAsync().catch(() => false);
}

const loadGoogleScript = () =>
    new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="translate_a/element.js"]')) {
            // script already injected (or a previous attempt)
            return resolve();
        }
        const s = document.createElement("script");
        s.src =
            "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = (e) =>
            reject(new Error("Failed to load Google Translate script"));
        document.head.appendChild(s);
    });

const initializeTranslateElement = () => {
    if (
        !window.google ||
        !window.google.translate ||
        !window.google.translate.TranslateElement
    ) {
        throw new Error("Google Translate objects missing");
    }
    // create element (google will inject .goog-te-combo)
    new window.google.translate.TranslateElement(
        {
            pageLanguage: "en",
            includedLanguages: gujaratLanguages.map((l) => l.code).join(","),
            layout: window.google.translate.TranslateElement.InlineLayout
                .HORIZONTAL,
            autoDisplay: false,
        },
        "google_translate_element"
    );
};

const RobustGujaratTranslator = () => {
    const [currentLanguage, setCurrentLanguage] = useState(
        localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG
    );
    const [status, setStatus] = useState("init"); // init | loading | ready | failed
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        const style = document.createElement("style");
        style.textContent = `
            /* Hide the Google Translate top bar */
            .goog-te-banner-frame {
                display: none !important;
                visibility: hidden !important;
                height: 0px !important;
                width: 0px !important;
                position: absolute !important;
                top: -1000px !important;
                left: -1000px !important;
                z-index: -1000 !important;
                opacity: 0 !important;
            }
            
            /* Hide the language selector dropdown that appears at top */
            .goog-te-menu-frame {
                max-width: 100% !important; /* Prevent overflow issues */
            }
            
            /* Remove the top spacing that Google Translate adds */
            body {
                top: 0px !important;
            }
            
            /* Hide the "Powered by Google Translate" text */
            .goog-logo-link {
                display: none !important;
            }
            
            .goog-te-gadget {
                color: transparent !important;
                font-size: 0px !important;
            }
            
            .goog-te-gadget .goog-te-combo {
                margin: 0px !important;
            }
            
            /* Fix for any remaining banner elements */
            .skiptranslate {
                display: none !important;
                visibility: hidden !important;
            }
        `;
        document.head.appendChild(style);

        const init = async () => {
            setStatus("loading");

            // If current language is English, no need to initialize Google Translate
            if (currentLanguage === "en") {
                setStatus("ready");
                return;
            }

            // establish global callback expected by the script
            window.googleTranslateElementInit = () => {
                try {
                    initializeTranslateElement();
                } catch (err) {
                    console.warn("init widget error:", err);
                }
            };

            try {
                await loadGoogleScript(); // may reject if blocked
            } catch (err) {
                console.warn(
                    "Google Translate script blocked or failed to load:",
                    err
                );
                if (!mountedRef.current) return;
                setStatus("failed");
                return;
            }

            // wait for widget to land and then apply saved language
            const sel = await waitForGoogleSelect(6000, 250);
            if (!mountedRef.current) return;
            if (!sel) {
                console.warn("translate widget not found after loading script");
                setStatus("failed");
                return;
            }

            // try to apply saved language
            const applied = tryApplyLanguageToWidget(currentLanguage);
            setStatus(applied ? "ready" : "failed");
            if (!applied) {
                // try one more time in case google takes a moment to populate values
                setTimeout(async () => {
                    if (!mountedRef.current) return;
                    const again = tryApplyLanguageToWidget(currentLanguage);
                    if (again) setStatus("ready");
                }, 800);
            }
        };

        init();

        return () => {
            mountedRef.current = false;
            // cleanup global callback if ours
            try {
                if (window.googleTranslateElementInit)
                    window.googleTranslateElementInit = null;
                if (style && style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            } catch (e) {}
        };
        // run once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChange = async (lang) => {
        setCurrentLanguage(lang);
        localStorage.setItem(STORAGE_KEY, lang);

        // If English, restore original content and don't use Google Translate
        if (lang === "en") {
            restoreToEnglish();
            setStatus("ready");
            return;
        }

        // For other languages, use Google Translate
        setStatus("loading");

        // immediate attempt
        const ok = tryApplyLanguageToWidget(lang);
        if (ok) {
            setStatus("ready");
        } else {
            // fallback: wait a bit for widget and try to apply
            const el = await waitForGoogleSelect(5000, 250);
            if (el) {
                const success = tryApplyLanguageToWidget(lang);
                setStatus(success ? "ready" : "failed");
            } else {
                setStatus("failed");
            }
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="relative">
                <p>Language : </p>
                <select
                    value={currentLanguage}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {gujaratLanguages.map((language) => (
                        <option key={language.code} value={language.code}>
                            {language.name}
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

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                    {status === "ready" ? (
                        <>
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />{" "}
                            Ready
                        </>
                    ) : status === "loading" ? (
                        <>
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />{" "}
                            Initializing...
                        </>
                    ) : (
                        <>
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1" />{" "}
                            Unavailable
                        </>
                    )}
                </span>
                <span>
                    {
                        gujaratLanguages.find((l) => l.code === currentLanguage)
                            ?.nativeName
                    }
                </span>
            </div>

            {/* hidden container for google widget */}
            <div id="google_translate_element" className="sr-only" />
        </div>
    );
};

export default RobustGujaratTranslator;
