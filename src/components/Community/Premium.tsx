import React, { useState } from "react";
import { Flex, Icon, Text, Stack, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Center } from "@chakra-ui/react";
import { GiCheckedShield } from "react-icons/gi";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/AuthModalAtom";

const Premium: React.FC = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [user] = useAuthState(auth);
    const setAuthModalState = useSetRecoilState(authModalState);
    
    const handleTryNow = () => {
        if (!user) {
            setAuthModalState({ open: true, view: 'login' });
            return;
        }

        setModalOpen(true);// Show the modal
    };

    const handleCloseModal = () => {
        setModalOpen(false);// Close the modal
    };

    return (
        <Flex
            direction="column"
            bg="white"
            borderRadius={4}
            cursor="pointer"
            p="12px"
            border="1px solid"
            borderColor="gray.300"
        >
            <Flex mb={2}>
                <Icon as={GiCheckedShield} fontSize={26} color="brand.100" mt={2} />
                <Stack spacing={1} fontSize="9pt" pl={2}>
                    <Text fontWeight={600}>Reddit Premium</Text>
                    <Text>The best Reddit experience, with monthly Coins</Text>
                </Stack>
            </Flex>

            <Button height="30px" bg="brand.100" onClick={handleTryNow}>
                Try Now
            </Button>

            {/* Modal */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
            >
                <ModalOverlay />
                <ModalContent
                    height="30%"
                    top="25%"
                >
                    <ModalCloseButton/>
                    <ModalBody
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="25px"
                    >
                        <Text>We're sorry,</Text>
                        <Text
                            color="red"
                            fontSize="25px"
                            textAlign="center"
                            fontWeight="200"
                            textTransform="uppercase"
                        >
                            not available at the moment
                        </Text>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    );
};
export default Premium;