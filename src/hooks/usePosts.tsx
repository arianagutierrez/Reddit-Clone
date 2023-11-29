import { authModalState } from '@/atoms/AuthModalAtom';
import { communityState } from '@/atoms/communitiesAtom';
import { Post, PostVote, postState } from '@/atoms/postsAtom';
import { auth, firestore, storage } from '@/firebase/clientApp';
import { doc, deleteDoc, writeBatch, collection, getDocs, query, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

const usePosts = () => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [postStateValue, setPostStateValue] = useRecoilState(postState);
    const currentCommunity = useRecoilValue(communityState).currentCommunity;
    const setAuthModalState = useSetRecoilState(authModalState);
    
    const onVote = async (
        event: React.MouseEvent<SVGElement, MouseEvent>, //keeps track of clicks on voting icons
        post: Post,
        vote: number,
        communityId: string
    ) => {
        //Avoids that when you vote in the PageCommunity it can automatically direct you to the PostPage
        //to stop propagation, prevent the event from travelling upwards to the parent(PostItem).
        event.stopPropagation();
        
        //if no user => open auth modal
        if (!user?.uid) {
            setAuthModalState({ open: true, view: "login" });
            return;
        }

        try {
            const { voteStatus } = post; //to search through the user PostVotes array in PostsAtoms.ts
            const existingVote = postStateValue.postVotes.find(
                (vote) => vote.postId === post.id
            );

            const batch = writeBatch(firestore);

            //The reason to create copies of the current value of State variables is because 
            //'post, posts and postVotes' are all going to need to be modified depending
            //on what piece of the logic we enter in the If Else statements.
            //In the end, we take those modifies values and use them to update 
            //State variables with updated values, and avoid mutating State directly 
            //because it can cause unwanted side effects

            const updatedPost = { ...post };
            const updatedPosts = [...postStateValue.posts];
            let updatedPostVotes = [...postStateValue.postVotes]; //to updating the votes
            let voteChange = vote; //represent the amount that either going to add/subtract to our Post document voteStatus

            //New vote(add/subtract 1)
            if(!existingVote) {
                // create a new postVote document
                const postVoteRef = doc(
                    collection(firestore, "users", `${user?.uid}/postVotes`)
                );
                
                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    communityId,
                    voteValue: vote, // 1 or -1
                };
          
                batch.set(postVoteRef, newVote);
                
                // add/subtract 1 to/from the post.voteStatus
                updatedPost.voteStatus = voteStatus + vote;
                updatedPostVotes = [...updatedPostVotes, newVote];
            }
            // Existing vote - they have voted on the post before
            else {
                const postVoteRef = doc(
                    firestore,
                    "users",
                    `${user?.uid}/postVotes/${existingVote.id}`
                );

                // Removing their vote (up => neutral OR down => neutral)
                if (existingVote.voteValue === vote) {
                    // add/subtract 1 to/from post.voteStatus
                    updatedPost.voteStatus = voteStatus - vote;
                    updatedPostVotes = updatedPostVotes.filter(
                        (vote) => vote.id !== existingVote.id
                    );

                    // delete the postVote document
                    batch.delete(postVoteRef);

                    voteChange *= -1;
                }

                // FLIPPING(add/subtract 2) their vote (up => down OR down => up)
                else {
                    // add/subtract 2 to/from post.voteStatus
                    updatedPost.voteStatus = voteStatus + 2 * vote;

                    const voteIdx = postStateValue.postVotes.findIndex(
                        (vote) => vote.id === existingVote.id
                    );

                    updatedPostVotes[voteIdx] = {
                        ...existingVote,
                        voteValue: vote,
                    };

                    // updating the existing postVote document
                    batch.update(postVoteRef, {
                        voteValue: vote,
                    });
            
                    voteChange = 2 * vote;
                }
            }

            // update State with updated values
            const postIdx = postStateValue.posts.findIndex( //to update our updatedPosts array
                (item) => item.id === post.id
              );
            updatedPosts[postIdx] = updatedPost;

            setPostStateValue((prev) => ({
                ...prev,
                posts: updatedPosts,
                postVotes: updatedPostVotes,
            }));
            
            //to update the postVotes in the PostPage
            if (postStateValue.selectedPost) {
                setPostStateValue((prev) => ({
                  ...prev,
                  selectedPost: updatedPost,
                }));
            }

            // update our Post document
            const postRef = doc(firestore, "posts", post.id!);
            batch.update(postRef, { voteStatus: voteStatus + voteChange });

            await batch.commit();
        } catch (error) {
            console.log("onVote error", error);
        }
    }

    //to see the PostPage of select post
    const onSelectPost = (post: Post) => {
        setPostStateValue((prev) => ({
            ...prev,
            selectedPost: post,
        }));
        router.push(`/r/${post.communityId}/comments/${post.id}`);
    }

    const onDeletePost = async (post: Post): Promise<boolean> => {
        try {
            //check if image, delete if exists
            if (post.imageURL) {
                const imageRef = ref(storage, `posts/${post.id}/image`);
                await deleteObject(imageRef);
            }

            //delete post document from firestore
            const postDocRef = doc(firestore, "posts", post.id!);
            await deleteDoc(postDocRef)

            //update recoil state
            setPostStateValue((prev) => ({
                ...prev,
                posts: prev.posts.filter((item) => item.id !== post.id),
            }));
            return true
        } catch (error) {
            return false
        }
    }

    const getCommunityPostVotes = async (communityId: string) => {
        const postVotesQuery = query(
            collection(firestore, "users", `${user?.uid}/postVotes`),
            where("communityId", "==", communityId)
        );
      
        const postVoteDocs = await getDocs(postVotesQuery);
        const postVotes = postVoteDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setPostStateValue((prev) => ({
            ...prev,
            postVotes: postVotes as PostVote[],
        }));
    }

    useEffect(() => {
        if (!user || !currentCommunity?.id) return;
        getCommunityPostVotes(currentCommunity?.id);
    }, [user, currentCommunity]);

    useEffect(() => {
        if (!user) {
            // Clear user post votes
            setPostStateValue((prev) => ({
                ...prev,
                postVotes: [],
            }));
        }
    }, [user]);

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost,
    };
}
export default usePosts;