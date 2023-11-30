import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

// Definizione dell'interfaccia per la rappresentazione di una comunità
export interface Community {
    id: string;                            
    creatorId: string;                      
    numberOfMembers: number;                
    privacyType: "public" | "restricted" | "private"; 
    createdAt?: Timestamp;                  // Data e ora di creazione della comunità (opzionale)
    imageURL?: string;                      // URL opzionale per l'immagine rappresentativa della comunità
}

// Definizione dell'interfaccia per una "CommunitySnippet", una breve rappresentazione di una comunità
export interface CommunitySnippet {
    communityId: string;               
    isModerator?: boolean;                  
    imageURL?: string;                      
}

// Definizione dello stato di una comunità nell'applicazione
interface CommunityState {
    mySnippets: CommunitySnippet[];         // Elenco di "CommunitySnippet" dell'utente
    currentCommunity?: Community;           // Informazioni sulla comunità correntemente selezionata
    snippetsFetched: boolean;               // Flag che indica se le informazioni sulla comunità sono state recuperate
}

// Stato predefinito per la gestione dello stato delle comunità nell'applicazione
const defaultCommunityState: CommunityState = {
    mySnippets: [],                         // Nessun snippet di comunità inizialmente
    snippetsFetched: false,                 // Le informazioni sulla comunità non sono ancora state recuperate
};

// Creazione di un atom Recoil per gestire lo stato delle comunità nell'applicazione
export const communityState = atom<CommunityState>({
    key: "communitiesState",                
    default: defaultCommunityState,         // Stato predefinito per la gestione dello stato delle comunità
});
