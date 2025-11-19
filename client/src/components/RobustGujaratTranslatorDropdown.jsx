// components/RobustGujaratTranslatorDropdown.js
import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "preferredLanguageDropdown";
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

const waitForGoogleSelect = (timeoutMs = 5000, intervalMs = 200) =>
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

const tryApplyLanguageToWidget = (languageCode) => {
    try {
        const sel = document.querySelector(".goog-te-combo");
        if (!sel) return false;
        if (sel.value === languageCode) return true;
        sel.value = languageCode;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
    } catch (err) {
        // do not throw in dropdown context
        return false;
    }
};

/**
 * Compact translator suitable for dropdown menus.
 * - saves to localStorage (STORAGE_KEY)
 * - small select & status text
 * - robustly attempts to apply saved language
 */
const RobustGujaratTranslatorDropdown = () => {
    const [lang, setLang] = useState(
        () => localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG
    );
    const [status, setStatus] = useState("init"); // init | loading | ready | failed
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        const ensureWidgetAndApply = async () => {
            setStatus("loading");

            // if widget already present - try apply now
            if (tryApplyLanguageToWidget(lang)) {
                if (!mountedRef.current) return;
                setStatus("ready");
                return;
            }

            // wait for widget, then try
            const el = await waitForGoogleSelect(6000, 200);
            if (!mountedRef.current) return;
            if (!el) {
                setStatus("failed");
                return;
            }

            const ok = tryApplyLanguageToWidget(lang);
            setStatus(ok ? "ready" : "failed");

            // one more attempt shortly after (sometimes Google populates options asynchronously)
            if (!ok) {
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    const again = tryApplyLanguageToWidget(lang);
                    if (again) setStatus("ready");
                }, 700);
            }
        };

        ensureWidgetAndApply();

        return () => {
            mountedRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChange = async (newLang) => {
        setLang(newLang);
        localStorage.setItem(STORAGE_KEY, newLang);

        // immediate attempt
        const ok = tryApplyLanguageToWidget(newLang);
        if (ok) {
            setStatus("ready");
            return;
        }

        // if not present, wait briefly for widget and try again
        const el = await waitForGoogleSelect(5000, 200);
        if (el) tryApplyLanguageToWidget(newLang);
    };

    return (
        <div className="px-2 py-2">
            {/* compact select + tiny status line */}
            <div className="flex items-center justify-between gap-3">
                <select
                    value={lang}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full text-sm appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    aria-label="Translate UI"
                    title="Translate UI"
                >
                    {gujaratLanguages.map((l) => (
                        <option key={l.code} value={l.code}>
                            {getFlagEmoji(l.code)} {l.nativeName}
                        </option>
                    ))}
                </select>

                {/* tiny status dot */}
                <div className="flex-shrink-0 w-6 text-xs text-right">
                    {status === "ready" ? (
                        <span
                            className="text-green-600"
                            title="Translator ready"
                        >
                            ●
                        </span>
                    ) : status === "loading" ? (
                        <span className="text-yellow-600" title="Initializing">
                            ●
                        </span>
                    ) : (
                        <span className="text-red-500" title="Unavailable">
                            ●
                        </span>
                    )}
                </div>
            </div>

            {/* optional small note (keeps dropdown compact) */}
            <div className="mt-1 text-xs text-gray-500">
                {status === "ready"
                    ? "Translated"
                    : status === "loading"
                    ? "Loading..."
                    : "Unavailable"}
            </div>
        </div>
    );
};

export default RobustGujaratTranslatorDropdown;
