import React, { createContext, useContext, useEffect, useState } from "react";

/*
  react-google-translate.jsx

  - Plain JSX version (no TypeScript)
  - Uses Google Translate Element script: https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit
  - Supports English (en), Hindi (hi), Gujarati (gu)
  - Applies translation to the entire DOM via the Google widget
  - Saves selected language to localStorage
  - Provides reusable UI components: LanguageDropdown, SidebarLanguage, ProfileLanguage
  - Wrap your app with <GoogleTranslateProvider> and include <GoogleTranslateElementContainer /> somewhere (provider example includes it)
*/

const GOOGLE_ELEMENT_SRC =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

const SUPPORTED_LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "gu", label: "ગુજરાતી (Gujarati)" },
];

const LS_KEY = "preferred_lang_google_translate";

function setGoogleTranslateLanguage(code) {
    const attempt = () => {
        var combo = document.querySelector("select.goog-te-combo");
        if (!combo) return false;
        combo.value = code;
        var event;
        try {
            event = new Event("change", { bubbles: true });
        } catch (e) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, true);
        }
        combo.dispatchEvent(event);
        return true;
    };

    var start = Date.now();
    var interval = setInterval(function () {
        var done = attempt();
        if (done || Date.now() - start > 3000) {
            clearInterval(interval);
        }
    }, 200);
}

var GoogleTranslateContext = createContext(null);

export function useGoogleTranslate() {
    var ctx = useContext(GoogleTranslateContext);
    if (!ctx)
        throw new Error(
            "useGoogleTranslate must be used inside GoogleTranslateProvider"
        );
    return ctx;
}

export function GoogleTranslateProvider(props) {
    var children = props.children;
    var [lang, setLangState] = useState(function () {
        try {
            return localStorage.getItem(LS_KEY) || "en";
        } catch (e) {
            return "en";
        }
    });

    useEffect(function () {
        if (document.querySelector("script[data-google-translate]")) return;

        window.googleTranslateElementInit = function () {
            try {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: SUPPORTED_LANGUAGES.map(function (
                            l
                        ) {
                            return l.code;
                        }).join(","),
                        layout: window.google.translate.TranslateElement
                            .InlineLayout.SIMPLE,
                    },
                    "google_translate_element"
                );
            } catch (e) {
                // init failed
            }
        };

        var s = document.createElement("script");
        s.src = GOOGLE_ELEMENT_SRC;
        s.async = true;
        s.setAttribute("data-google-translate", "1");
        document.body.appendChild(s);

        return function () {
            try {
                delete window.googleTranslateElementInit;
            } catch (e) {}
        };
    }, []);

    useEffect(
        function () {
            try {
                localStorage.setItem(LS_KEY, lang);
            } catch (e) {}
            setGoogleTranslateLanguage(lang);
        },
        [lang]
    );

    useEffect(function () {
        var t = setTimeout(function () {
            setGoogleTranslateLanguage(lang);
        }, 500);
        return function () {
            clearTimeout(t);
        };
    }, []);

    var setLang = function (code) {
        setLangState(code);
    };

    return React.createElement(
        GoogleTranslateContext.Provider,
        { value: { lang: lang, setLang: setLang } },
        children
    );
}

export function GoogleTranslateElementContainer() {
    return (
        <div aria-hidden="true" className="sr-only">
            <div id="google_translate_element" />
            <style>{`
        /* hide top banner inserted by google */
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0 !important; }
        /* hide powered-by link */
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; }
      `}</style>
        </div>
    );
}

export function LanguageDropdown() {
    var _useGoogleTranslate = useGoogleTranslate(),
        lang = _useGoogleTranslate.lang,
        setLang = _useGoogleTranslate.setLang;

    return React.createElement(
        "div",
        { className: "inline-block" },
        React.createElement(
            "label",
            { className: "text-sm font-medium mr-2" },
            "Language"
        ),
        React.createElement(
            "select",
            {
                value: lang,
                onChange: function (e) {
                    setLang(e.target.value);
                },
                className: "border rounded px-2 py-1",
                "aria-label": "Select language",
            },
            SUPPORTED_LANGUAGES.map(function (l) {
                return React.createElement(
                    "option",
                    { key: l.code, value: l.code },
                    l.label
                );
            })
        )
    );
}

export function SidebarLanguage() {
    var _useGoogleTranslate2 = useGoogleTranslate(),
        lang = _useGoogleTranslate2.lang,
        setLang = _useGoogleTranslate2.setLang;

    return React.createElement(
        "div",
        { className: "p-3" },
        React.createElement(
            "div",
            { className: "text-xs text-gray-500 mb-1" },
            "App language"
        ),
        React.createElement(
            "div",
            { className: "flex flex-col gap-2" },
            SUPPORTED_LANGUAGES.map(function (l) {
                return React.createElement(
                    "button",
                    {
                        key: l.code,
                        onClick: function () {
                            return setLang(l.code);
                        },
                        className:
                            "text-left px-3 py-2 rounded hover:bg-gray-100 " +
                            (lang === l.code
                                ? "bg-gray-200 font-semibold"
                                : ""),
                    },
                    l.label
                );
            })
        )
    );
}

export function ProfileLanguage() {
    var _useGoogleTranslate3 = useGoogleTranslate(),
        lang = _useGoogleTranslate3.lang,
        setLang = _useGoogleTranslate3.setLang;

    var currentLabel = SUPPORTED_LANGUAGES.find(function (l) {
        return l.code === lang;
    });
    currentLabel = currentLabel ? currentLabel.label : "English";

    return React.createElement(
        "div",
        { className: "flex items-center gap-3" },
        React.createElement("div", { className: "text-sm" }, "Language"),
        React.createElement(
            "div",
            { className: "text-sm font-medium" },
            currentLabel
        ),
        React.createElement(
            "button",
            {
                onClick: function () {
                    var idx = SUPPORTED_LANGUAGES.findIndex(function (x) {
                        return x.code === lang;
                    });
                    var next =
                        SUPPORTED_LANGUAGES[
                            (idx + 1) % SUPPORTED_LANGUAGES.length
                        ];
                    setLang(next.code);
                },
                className: "ml-3 px-2 py-1 border rounded",
            },
            "Change"
        )
    );
}

export function ExampleAppWrapper(_ref) {
    var children = _ref.children;
    return React.createElement(
        GoogleTranslateProvider,
        null,
        React.createElement(GoogleTranslateElementContainer, null),
        React.createElement(
            "div",
            { className: "min-h-screen bg-white text-black" },
            React.createElement(
                "header",
                { className: "p-4 border-b flex justify-between items-center" },
                React.createElement(
                    "div",
                    { className: "text-lg font-bold" },
                    "My App"
                ),
                React.createElement(
                    "div",
                    { className: "flex items-center gap-4" },
                    React.createElement(LanguageDropdown, null)
                )
            ),
            React.createElement(
                "div",
                { className: "flex" },
                React.createElement(
                    "aside",
                    { className: "w-64 border-r p-4" },
                    React.createElement(SidebarLanguage, null)
                ),
                React.createElement(
                    "main",
                    { className: "flex-1 p-6" },
                    React.createElement(
                        "div",
                        { className: "mb-6" },
                        React.createElement(ProfileLanguage, null)
                    ),
                    React.createElement(
                        "div",
                        null,
                        React.createElement(
                            "h1",
                            { className: "text-2xl mb-4" },
                            "Content"
                        ),
                        React.createElement(
                            "p",
                            null,
                            "This is your app content. When you change the language using the dropdown, sidebar, or profile controls, the Google Translate widget will translate the DOM into the chosen language (English, Hindi, Gujarati)."
                        )
                    )
                )
            )
        )
    );
}

export default GoogleTranslateProvider;
