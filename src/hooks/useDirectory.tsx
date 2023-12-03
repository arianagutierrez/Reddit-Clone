import { useRouter } from "next/router";
import { useEffect } from "react";
import { FaReddit } from "react-icons/fa";
import { useRecoilState } from "recoil";
import { communityState } from "../atoms/communitiesAtom";
import {
    defaultMenuItem,
    DirectoryMenuItem,
    directoryMenuState,
} from "../atoms/directoryMenuAtom";

const useDirectory = () => {
    const [directoryState, setDirectoryState] =
        useRecoilState(directoryMenuState);
    const router = useRouter();
    const [communityStateValue, setCommunityStateValue] =
        useRecoilState(communityState);

    //to handle the selection of a menu item.
    const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
        // Aggiorna lo stato del menu con l'elemento selezionato
        setDirectoryState((prev) => ({
            ...prev,
            selectedMenuItem: menuItem,
        }));

        // Naviga verso l'URL specificato dall'elemento del menu
        router.push(menuItem.link);

        // Se il menu è aperto, chiudilo
        if (directoryState.isOpen) {
            toggleMenuOpen();
        }
    };

    //to change the open state of our directory menu
    const toggleMenuOpen = () => {
        setDirectoryState((prev) => ({
            ...prev,
            isOpen: !directoryState.isOpen,
        }));
    };

    useEffect(() => {
        const { currentCommunity } = communityStateValue;

        if (currentCommunity) {
            setDirectoryState((prev) => ({
                ...prev,
                //to update the selected Menu
                selectedMenuItem: {
                    displayText: `r/${currentCommunity.id}`,
                    link: `/r/${currentCommunity.id}`,
                    imageURL: currentCommunity.imageURL,
                    icon: FaReddit,
                    iconColor: "blue.500",
                },
            }));
            return;
        }

        setDirectoryState((prev) => ({
            ...prev,
            selectedMenuItem: defaultMenuItem,
        }));
    }, [communityStateValue.currentCommunity, setDirectoryState]);

    useEffect(() => {
        const { communityId } = router.query;

        if (!communityId) {
        setCommunityStateValue((prev) => ({
            ...prev,
            currentCommunity: undefined,
        }));
        }
    }, [router.query, setCommunityStateValue]);

    return { directoryState, toggleMenuOpen, onSelectMenuItem };
};
export default useDirectory;