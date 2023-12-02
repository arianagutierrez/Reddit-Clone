import { SearchIcon } from '@chakra-ui/icons';
import { Box, Flex, Icon, Image, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useState } from 'react';
import { FaReddit } from 'react-icons/fa';

type SearchInputProps = {
    user?: User | null;
};

const SearchInput: React.FC<SearchInputProps> = ({ user }) => {
    const [searchResults, setSearchResults] = useState<{ id: string; imageURL: any }[]>([])
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSearch = async () => {
        setIsDropdownOpen(true);
        try {
            const db = getFirestore();
            const communitiesRef = collection(db, 'communities');
            
            const communities = await getDocs(communitiesRef);
            const results = communities.docs.map((doc) => {
                const communityData = doc.data();
                const imageURL = communityData.imageURL ? communityData.imageURL : null;
                return {
                  id: doc.id,
                  imageURL,
                };
            });
            console.log('Search Results:', results);
            
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching communities:', error);
        }

        if (isDropdownOpen) {
            setIsDropdownOpen(false);
        }
    };

    const handleCommunityClick = (communityId: string) => {
        router.push(`/r/${communityId}`);
        setIsDropdownOpen(false);
    };

    return (
        <Flex 
            flexGrow={1} 
            mr={2} 
            alignItems="center" 
            maxWidth={user ? 'auto' : '600px'} 
            position="relative"
        >
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" mb={2} />
                </InputLeftElement>
                <Input
                    type="search"
                    placeholder="Search Reddit"
                    fontSize="10pt"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    _focus={{
                        outline: 'none',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    height="34px"
                    bg="gray.50"
                    onClick={handleSearch}
                />
            </InputGroup>
            {isDropdownOpen && (
                <Box
                    position="absolute"
                    top="100%"
                    left="0"
                    width="100%"
                    background="white"
                    border="1px solid"
                    borderColor="blue.500"
                    zIndex="1"
                >
                {searchResults.map((community) => (
                    <Box
                        key={community.id}
                        p="2"
                        borderBottom="1px solid"
                        borderBottomColor="gray.200"
                        onClick={() => handleCommunityClick(community.id)}
                        cursor="pointer"
                        _hover={{
                            bg: 'gray.100',
                        }}
                        fontSize="15px"
                        display="Flex"
                        placeItems="center"
                    >
                        {community.imageURL ? (
                            <Image src={community.imageURL} borderRadius="full" boxSize="18px" mr={2} />
                        ) : (
                            <Icon as={FaReddit} fontSize={20} mr={2} color={'gray'} />
                        )}
                        {`r/${community.id}`}
                    </Box>
                ))}
                </Box>
            )}
        </Flex>
    );
};

export default SearchInput;