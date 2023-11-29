import CreateCommunityModal from '@/components/Modal/Auth/CreateCommunity/CreateCommunityModal';
import { MenuItem, Flex, Icon } from '@chakra-ui/react';
import React, { useState } from 'react';
import { GrAdd } from 'react-icons/gr';

type CommunitiesProps = {};

const Communities:React.FC<CommunitiesProps> = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <CreateCommunityModal
                open={open}
                // isOpen={open}
                handleClose={() => setOpen(false)}
                // userId={user?.uid!}
            />
            <MenuItem
                width="100%"
                fontSize="10pt"
                _hover={{ bg: "gray.200" }}
                onClick={() => setOpen(true)}
            >
                <Flex alignItems="center">
                    <Icon fontSize={20} mr={2} as={GrAdd} />
                    Create Community
                </Flex>
            </MenuItem> 
        </>
    )
}

export default Communities;