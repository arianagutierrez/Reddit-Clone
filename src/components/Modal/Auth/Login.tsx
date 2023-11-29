import { Button, Flex, Input, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSetRecoilState} from 'recoil'
import { authModalState } from '@/atoms/AuthModalAtom';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';
import { FIREBASE_ERRORS } from '@/firebase/errors';

type LoginProps = {};

const Login:React.FC<LoginProps> = () => {
    const setAuthModalState = useSetRecoilState(authModalState)
    const [loginform, setLoginForm] = useState({
        email: "",
        password: "",
    });
    const [signInWithEmailAndPassword, user, loading, error] = 
        useSignInWithEmailAndPassword(auth);

    //Firebase login
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        signInWithEmailAndPassword(loginform.email, loginform.password)
    };

    // const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    //     event.preventDefault();
    //     if (formError) setFormError("");
    //     if (!form.email.includes("@")) {
    //       return setFormError("Please enter a valid email");
    //     }
    
    //     // Valid form inputs
    //     signInWithEmailAndPassword(form.email, form.password);
    // };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        //update form state
        setLoginForm(prev => ({
            ...prev,
            [event.target.name]: event.target.value,
        }))
    };

    // const onChange = ({
    //     target: { name, value },
    //   }: React.ChangeEvent<HTMLInputElement>) => {
    //     setForm((prev) => ({
    //       ...prev,
    //       [name]: value,
    //     }));
    // };

    return (
        <form onSubmit={onSubmit}>
            <Input
                required
                name="email"
                placeholder="email"
                type="email"
                mb={2}
                onChange={onChange}
                fontSize='10pt'
                _placeholder={{color: "gray.500"}}
                _hover={{
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                _focus={{
                    outline: "none",
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                bg="gray.50"
            />
            <Input
                required
                name="password"
                placeholder="password"
                type="password"
                onChange={onChange}
                mb={2}
                fontSize='10pt'
                _placeholder={{color: "gray.500"}}
                _hover={{
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                _focus={{
                    outline: "none",
                    bg: "white",
                    border: "1px solid",
                    borderColor: "blue.500",
                }}
                bg="gray.50"
            />

            <Text textAlign="center" mt={2} fontSize="10pt" color="red">
                { FIREBASE_ERRORS[error?.message as keyof typeof FIREBASE_ERRORS]}
            </Text>

            <Button
                width="100%"
                height="36px"
                mb={2}
                mt={2}
                type="submit"
                isLoading={loading}
            >
                Log In
            </Button>
            <Flex justifyContent="center" mb={2}>
                <Text fontSize="9pt" mr={1}>
                    Forgot your password?
                </Text>
                <Text
                    fontSize="9pt"
                    color="blue.500"
                    cursor="pointer"
                    onClick={() => 
                        setAuthModalState((prev) => ({
                            ...prev,
                            view: "resetPassword",
                    }))}
                    // onClick={() => toggleView("resetPassword")}
                >
                    Reset
                </Text>
            </Flex>
            <Flex fontSize="9pt" justifyContent="center">
                <Text mr={1}>New here?</Text>
                <Text
                    color="blue.500"
                    fontWeight={700}
                    cursor="pointer"
                    onClick={() => 
                        setAuthModalState((prev) => ({
                            ...prev,
                            view: "signup",
                        }))
                    }
                    // onClick={() => toggleView("signup")}
                >
                SIGN UP
                </Text>
            </Flex>
        </form>
    )
}
export default Login;