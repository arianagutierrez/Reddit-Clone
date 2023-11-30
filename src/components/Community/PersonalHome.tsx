import { authModalState } from "@/atoms/AuthModalAtom";
import { auth } from "@/firebase/clientApp";
import useDirectory from "@/hooks/useDirectory";
import { Button, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaReddit } from "react-icons/fa";
import { useSetRecoilState } from "recoil";
import CreateCommunityModal from "../Modal/Auth/CreateCommunity/CreateCommunityModal";
import error from "next/error";

const PersonalHome: React.FC = () => {
    const [user] = useAuthState(auth);
    const setAuthModalState = useSetRecoilState(authModalState);
    const { toggleMenuOpen } = useDirectory();
    const [isCreateCommunityModalOpen, setCreateCommunityModalOpen] = useState(false);

    const handleClick = (action: 'createPost' | 'createCommunity'): void => {
        if (!user) {
            setAuthModalState({ open: true, view: 'login' });
            return;
        }
    
        toggleMenuOpen();
    
        if (action === 'createCommunity') {
            setCreateCommunityModalOpen(true);
        }
    };

    return (
        <Flex
            direction="column"
            bg="white"
            borderRadius={4}
            cursor="pointer"
            border="1px solid"
            borderColor="gray.300"
            position="sticky"
        >
            <Flex
                align="flex-end"
                color="white"
                p="6px 10px"
                bg="blue.500"
                height="34px"
                borderRadius="4px 4px 0px 0px"
                fontWeight={600}
                bgImage="url(/images/redditPersonalHome.png)"
                backgroundSize="cover"
            ></Flex>
            <Flex direction="column" p="12px">
                <Flex align="center" mb={2}>
                    <Icon as={FaReddit} fontSize={50} color="brand.100" mr={2} />
                    <Text fontWeight={600}>Home</Text>
                </Flex>
                <Stack spacing={3}>
                    <Text fontSize="9pt">
                        Your personal Reddit frontpage, built for you.
                    </Text>
                    <Button 
                        height="30px"
                        onClick={() => handleClick('createPost')}
                    >
                        Create Post
                    </Button>

                    <Button 
                        variant="outline" 
                        height="30px"
                        onClick={() => handleClick('createCommunity')}
                    >
                        Create Community
                    </Button>

                    <CreateCommunityModal
                        open={isCreateCommunityModalOpen}
                        handleClose={() => setCreateCommunityModalOpen(false)}
                    />
                </Stack>
            </Flex>
        </Flex>
    );
};
export default PersonalHome;
