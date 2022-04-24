import React, { useState, useEffect, createContext } from "react";
import { LanguageSelect, CountDownSlider } from "./setting-form.component";

const LANGUAGE = "language";
const COUNTDOWN_TIMER = "countdown_time";
const INITIAL_DISCLAIMER = "initial_disclaimer";

const LANGUAGES = {
  EN: "EN",
  DE: "DE",
};

const LANGUAGE_DATA = {
  EN: {
    settings: "Settings",
    appName: "CoronaTest",
    drawerList: [
      <LanguageSelect name={"Language"} formTitle={"Select Language"} />,
      <CountDownSlider
        name={"Countdown"}
        formTitle={"Select Countdown Time"}
      />,
    ],
    version: "0.1.0",
    language: "English",
    langaugeTitle: "Language",
    versionTitle: "Version",
    cancel: "Cancel",
    submit: "Save",
  },
  DE: {
    settings: "Einstellungen",
    appName: "CoronaTest",
    drawerList: [
      <LanguageSelect name={"Sprachen"} formTitle={"Sprachen Auswahlen"} />,
      <CountDownSlider
        name={"Countdownzeit"}
        formTitle={"Wählen Sie Countdownzeit aus"}
      />,
    ],
    version: "0.1.0",
    language: "Deutsch",
    langaugeTitle: "Sprachen",
    versionTitle: "Version",
    cancel: "Abbrechen",
    submit: "Speichern",
  },
};

export const SettingsContext = createContext({
  currentLanguage: LANGUAGES.EN,
  changeLanguage: () => {},
  languageData: LANGUAGE_DATA.EN,
  countdownTimer: 5,
  changeCountdownTimer: () => {},
  initialDisclaimer: false,
  changeInitialDisclaimer: () => {},
  languageList: Object.values(LANGUAGES),
});

const SettingsProvider = ({ children }) => {
  const [currentLanguage, setLanguage] = useState(
    localStorage.getItem(LANGUAGE)
      ? localStorage.getItem(LANGUAGE)
      : LANGUAGES.EN
  );

  const changeLanguage = (language) => {
    localStorage.setItem(LANGUAGE, LANGUAGES[language]);
    setLanguage(LANGUAGES[language]);
  };

  const [languageData, setLanguageData] = useState(
    localStorage.getItem(LANGUAGE)
      ? LANGUAGE_DATA[localStorage.getItem(LANGUAGE)]
      : LANGUAGE_DATA[currentLanguage]
  );
  const [countdownTimer, setCountdownTimer] = useState(
    localStorage.getItem(COUNTDOWN_TIMER)
      ? parseInt(localStorage.getItem(COUNTDOWN_TIMER))
      : 5
  );

  const changeCountdownTimer = (value) => {
    localStorage.setItem(COUNTDOWN_TIMER, value);
    setCountdownTimer(value);
  };

  const [initialDisclaimer, setInitialDisclaimer] = useState(
    localStorage.getItem(INITIAL_DISCLAIMER)
      ? localStorage.getItem(INITIAL_DISCLAIMER)
      : false
  );

  const changeInitialDisclaimer = (value) => {
    localStorage.setItem(INITIAL_DISCLAIMER, value);
    setInitialDisclaimer(value);
  };

  useEffect(() => {
    setLanguageData(LANGUAGE_DATA[currentLanguage]);
  }, [changeLanguage]);

  return (
    <SettingsContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        languageData,
        countdownTimer,
        changeCountdownTimer,
        initialDisclaimer,
        changeInitialDisclaimer,
        languageList: Object.values(LANGUAGES),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
