import { authModalState } from '@/atoms/AuthModalAtom';
import { Community, CommunitySnippet, communityState } from '@/atoms/communitiesAtom';
import { auth, firestore } from '@/firebase/clientApp';
import { collection, doc, getDoc, getDocs, increment, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useSetRecoilState } from 'recoil';

const useCommunityData = () => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [communityStateValue, setCommunityStateValue] =
        useRecoilState(communityState)
    const setAuthModalState = useSetRecoilState(authModalState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onJoinOrLeaveCommunity = (
        communityData: Community,
        isJoined: boolean
    ) => {
        // is the user signed in?
            // if not => open auth modal
        if (!user) {
            // open modal
            setAuthModalState({ open: true, view: "login" });
            return;
        }

        setLoading(true);
        if (isJoined) {
            leaveCommunity(communityData.id);
            return;
        }
        joinCommunity(communityData);
    }

    const getMySnippets = async () => {
        setLoading(true);
        try {
            // get users snippets
            const snippetDocs = await getDocs(
                collection(firestore, `users/${user?.uid}/communitySnippets`)
            );
    
            const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
            console.log("here are snippets", snippets)

            //Update the status of the community with newly obtained snippets.
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: snippets as CommunitySnippet[],
                snippetsFetched: true, //per indicare che gli snippet sono stati recuperati 'HomePage'
            }));
        } catch (error: any) {
            console.log("getMySnippets error", error);
            setError(error.message);
        }
        setLoading(false);
    };

    const joinCommunity = async (communityData: Community) => {
        try{
            // batch write
            const batch = writeBatch(firestore);
            
            // creating a new community snippet
            const newSnippet: CommunitySnippet = {
                communityId: communityData.id,
                imageURL: communityData.imageURL || "",
                isModerator: user?.uid === communityData.creatorId,
            };

            batch.set(
                doc(
                  firestore,
                  `users/${user?.uid}/communitySnippets`,
                  communityData.id
                ),
                newSnippet
            );
            
            // updating the numberOfMembers (1)
            batch.update(doc(firestore, "communities", communityData.id), {
                numberOfMembers: increment(1),
            });
            await batch.commit();

            // update recoil state - communityState.mySnippets
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: [...prev.mySnippets, newSnippet],
            }));
        } catch (error: any){
            console.log("joinCommunity error", error);
            setError(error.message);
        }
        setLoading(false) 
    }

    const leaveCommunity = async (communityId: string) => {
        try {
            // batch write
            const batch = writeBatch(firestore);

            // deleting the community snippet
            batch.delete(
                doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
            );

            // updating the numberOfMembers (-1)
            batch.update(doc(firestore, "communities", communityId), {
                numberOfMembers: increment(-1),
            });
            await batch.commit();

            // update recoil state - communityState.mySnippets
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: prev.mySnippets.filter(
                  (item) => item.communityId !== communityId
                ),
            }));
        } catch (error:any) {
            console.log("leaveCommunity error", error.message);
            setError(error.message);
        }
        setLoading(false);  
    }

    const getCommunityData = async (communityId: string) => {
        try {
            const communityDocRef = doc(firestore, "communities", communityId);
            const communityDoc = await getDoc(communityDocRef);
        
            setCommunityStateValue((prev) => ({
                ...prev,
                currentCommunity: {
                id: communityDoc.id,
                ...communityDoc.data(),
                } as Community,
            }));
        } catch (error) {
            console.log("getCommunityData", error);
        }
    };

    useEffect(() => {
        if (!user) {
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: [], //To update the snippets when logOut
                snippetsFetched: false,
            }));
            return;
        }
        getMySnippets();
    }, [user]);

    useEffect(() => {
        const { communityId } = router.query;
    
        if (communityId && !communityStateValue.currentCommunity) {
            getCommunityData(communityId as string);
        }
    }, [router.query, communityStateValue.currentCommunity, getCommunityData]);
 
    return {
        //data and functions
        communityStateValue,
        onJoinOrLeaveCommunity,
        loading,
    }
}
export default useCommunityData;

function setAuthModalState(arg0: { open: boolean; view: string; }) {
    throw new Error('Function not implemented.');
}
