import { IconType } from "react-icons";
import { TiHome } from "react-icons/ti";
import { atom } from "recoil";

// Definizione del tipo di oggetto per gli elementi del menu
export type DirectoryMenuItem = {
    displayText: string;       // Testo da visualizzare nel menu
    link: string;              // URL di destinazione del link
    icon: IconType;            // Tipo di icona React da utilizzare
    iconColor: string;         // Colore dell'icona
    imageURL?: string;         // URL opzionale di un'immagine
};

// Interfaccia per lo stato del menu
interface DirectoryMenuState {
    isOpen: boolean;                        // Flag che indica se il menu è aperto o chiuso
    selectedMenuItem: DirectoryMenuItem;   // Elemento del menu attualmente selezionato
}

// Definizione dell'elemento predefinito per il menu
export const defaultMenuItem: DirectoryMenuItem = {
    displayText: "Home",   // Testo predefinito per l'elemento Home
    link: "/",             // URL predefinito per l'elemento Home
    icon: TiHome,          // Icona predefinita per l'elemento Home
    iconColor: "black",    // Colore predefinito dell'icona
};

// Definizione dello stato predefinito del menu
export const defaultMenuState: DirectoryMenuState = {
    isOpen: false,                       // Menu inizialmente chiuso
    selectedMenuItem: defaultMenuItem,   // Elemento Home selezionato inizialmente
};

// Creazione di un atom Recoil per gestire lo stato del menu
export const directoryMenuState = atom<DirectoryMenuState>({
    key: "directoryMenuState",  // Chiave univoca per identificare lo stato del menu
    default: defaultMenuState,   // Valore predefinito per lo stato del menu
});