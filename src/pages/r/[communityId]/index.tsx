import { Community, communityState } from '@/atoms/communitiesAtom';
import About from '@/components/Community/About';
import CreatePostLink from '@/components/Community/CreatePostLink';
import Header from '@/components/Community/Header';
import NotFound from '@/components/Community/NotFound';
import PageContent from '@/components/Layout/PageContent';
import Posts from '@/components/Posts/Posts';
import { firestore } from '@/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
// Next.js doesn't know how to serialize ".communityData.createdAt" data type. The solution for this error is to use a library called JSON Stringify, that
// stringifies our data to a form that Next.js can read and serialize.
import safeJsonStringify from "safe-json-stringify";

type CommunityPageProps = {
    communityData: Community;
};

const CommunityPage:React.FC<CommunityPageProps> = ({communityData}) => {
    console.log("here is data", communityData);
    const setCommunityStateValue = useSetRecoilState(communityState);

    useEffect(() => {
        setCommunityStateValue((prev) => ({
          ...prev,
          currentCommunity: communityData,
        }));
    }, [communityData, setCommunityStateValue]);

    if (!communityData) {
        return <NotFound />;
    }

    return (
        <>
          <Header communityData={communityData} />
          <PageContent>
            {/* Left HS */}
            <>
                <CreatePostLink />
                <Posts communityData={communityData} />
            </>

            {/* Right HS */}
            <>
                <About communityData={communityData} />
            </>
          </PageContent>
        </>
    );
    
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    // get community data and pass it to client
    try {
        const communityDocRef = doc(
        firestore,
        "communities",
        context.query.communityId as string
        );
        const communityDoc = await getDoc(communityDocRef);

        return {
            props: {
                communityData: communityDoc.exists()
                ? JSON.parse(
                    safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
                    )
                : "",
            },
        };
    } catch (error) {
        // Could add error page here
        console.log("getServerSideProps error", error);
    }
}

export default CommunityPage;