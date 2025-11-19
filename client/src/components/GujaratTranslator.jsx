// components/RobustGujaratTranslator.js
import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "preferredLanguage";
const DEFAULT_LANG = "en";

const gujaratLanguages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
];

const getFlagEmoji = (languageCode) => {
    const flagEmojis = { en: "🇺🇸", gu: "🇮🇳", hi: "🇮🇳" };
    return flagEmojis[languageCode] || "🌐";
};

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
 * Public helper: attempt to apply preferred language (from localStorage) to the Google widget.
 * Returns a promise that resolves true if applied, false otherwise.
 */
export const applyPreferredLanguageAsync = async (timeoutMs = 5000) => {
    const lang = localStorage.getItem(STORAGE_KEY);
    if (!lang) return false;

    // If widget already present, try immediately
    if (document.querySelector(".goog-te-combo")) {
        return tryApplyLanguageToWidget(lang);
    }

    // Otherwise wait for the widget to appear (script might still be loading)
    const el = await waitForGoogleSelect(timeoutMs);
    if (!el) {
        console.warn("Google translate widget did not appear within timeout.");
        return false;
    }
    return tryApplyLanguageToWidget(lang);
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
        const init = async () => {
            setStatus("loading");

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
            } catch (e) {}
        };
        // run once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChange = async (lang) => {
        setCurrentLanguage(lang);
        localStorage.setItem(STORAGE_KEY, lang);

        // immediate attempt
        const ok = tryApplyLanguageToWidget(lang);
        if (!ok) {
            // fallback: wait a bit for widget and try to apply
            const el = await waitForGoogleSelect(5000, 250);
            if (el) tryApplyLanguageToWidget(lang);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="relative">
                <select
                    value={currentLanguage}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {gujaratLanguages.map((language) => (
                        <option key={language.code} value={language.code}>
                            {getFlagEmoji(language.code)} {language.nativeName}{" "}
                            - {language.name}
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
            <div id="google_translate_element" className="hidden" />
        </div>
    );
};

export default RobustGujaratTranslator;
