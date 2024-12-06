"use client"
import { useState } from 'react';
import { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ethers } from 'ethers';
import { stringToBigInt } from '@/utils/convertions';
import { testSmartContractAddress } from '@/utils/config';
import { testABI } from '@/utils/testAbi';
import { EthersContext } from '@/context/EthersContext';

export default function DepositComponent({ contract }) {
    const [amount, setAmount] = useState('');
    const { setIsLoading } = useContext(EthersContext);

    const handleDeposit = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(testSmartContractAddress, testABI, signer);
            const tx = await contract.deposit({
                value: stringToBigInt(amount)
            });
            await tx.wait();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Make a Deposit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                    type="number"
                    placeholder="Amount in ETH"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                    onClick={handleDeposit}
                    className="w-full"
                >
                    Deposit
                </Button>
            </CardContent>
        </Card>
    );
}