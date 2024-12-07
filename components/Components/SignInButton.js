'use client';

import React, { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useOkto } from 'okto-sdk-react';
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignInButton() {
    const { data: session } = useSession();
    const { isLoggedIn, createWallet, authenticate, getWallets } = useOkto();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [walletCreated, setWalletCreated] = useState(false);

    const handleAuthenticate = async (token) => {
        return new Promise((resolve, reject) => {
            authenticate(token, (authResponse, error) => {
                if (authResponse) {
                    console.log("Authentication successful:", authResponse);
                    resolve(authResponse);
                }
                if (error) {
                    console.error("Authentication error:", error);
                    reject(error);
                }
            });
        });
    };

    const handleCreateWallet = async () => {
        try {
            setLoading(true);
            const result = await createWallet();
            console.log('Wallet created:', result)
            await initiator();
            setWalletCreated(true);
        } catch (error) {
            setError("Failed to create wallet. Please try again.");
            console.error('Wallet creation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMainAction = async () => {
        try {
            setLoading(true);
            setError("");

            if (!session) {
                const result = await signIn('google', { callbackUrl: '/' });
                if (result?.error) {
                    throw new Error('Google sign-in failed');
                }
            } else if (!isLoggedIn) {
                await handleAuthenticate(session.id_token);
            } else if (!walletCreated) {
                await handleCreateWallet();
            } else {
                await signOut({ callbackUrl: '/' });
            }
        } catch (error) {
            setError(error.message || "An error occurred. Please try again.");
            console.error('Action error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (loading) {
            return "Processing...";
        }
        if (!session) {
            return "Sign in with Google";
        }
        if (!isLoggedIn) {
            return "Authenticate with Okto";
        }
        if (!walletCreated) {
            return "Create Wallet";
        }
        return "Sign Out";
    };

    const getButtonVariant = () => {
        if (!session || !isLoggedIn || !walletCreated) {
            return "default";
        }
        return "destructive";
    };
  const initiator = async()=>{
    if(isLoggedIn){
      let res =await getWallets()
      if(res?.wallets?.length>0)setWalletCreated(true)
    }else console.log("not logged in");
    
  }
  useEffect(() => {
    initiator()
  }, [isLoggedIn])
  
    return (
        <div className="w-full flex justify-center px-4">
            <Card className="w-full max-w-md">
                <CardContent className="py-3">
                    {session ? (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 min-w-0">
                                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground truncate">
                                    {session.user?.email}
                                </span>
                            </div>
                            <Button
                                className="shrink-0"
                                variant={getButtonVariant()}
                                disabled={loading}
                                onClick={handleMainAction}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {getButtonText()}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="w-full"
                            variant={getButtonVariant()}
                            disabled={loading}
                            onClick={handleMainAction}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {getButtonText()}
                        </Button>
                    )}

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}