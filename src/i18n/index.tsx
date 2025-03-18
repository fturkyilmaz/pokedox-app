import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { resources } from "./resources"
import { getLocales } from 'expo-localization';

const lng = getLocales()[0].languageCode || "tr";

i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "tr",
})

export default i18n;