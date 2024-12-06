"use client"
import React, { useContext, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Wallet, Loader2, ChevronDown, LogOut } from 'lucide-react';
import { shortenAddress } from '@/utils/convertions';
import { EthersContext } from '@/context/EthersContext';

const ConnectWallet = () => {
    const { address,setAddress } = useContext(EthersContext)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    

    const connectWallet = async () => {
        setIsLoading(true);
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to connect a wallet');
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            setAddress(accounts[0]);
        } catch (err) {
            setError(err.message);
            setShowDialog(true);
        } finally {
            setIsLoading(false);
        }
    };

    const disconnectWallet = () => {
        setAddress('');
    };

    const copyAddress = async () => {
        if (address) {
            await navigator.clipboard.writeText(address);
        }
    };

    return (
        <>
            {!address ? (
                <Button
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Wallet className="h-4 w-4" />
                    )}
                    Connect Wallet
                </Button>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Wallet className="h-4 w-4" />
                            {shortenAddress(address)}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={copyAddress}>
                            Copy Address
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={disconnectWallet}
                            className="text-red-600"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Disconnect
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Connection Error</AlertDialogTitle>
                        <AlertDialogDescription>
                            {error}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ConnectWallet;