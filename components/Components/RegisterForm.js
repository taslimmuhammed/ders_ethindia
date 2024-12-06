import React, { useContext } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { EthersContext } from '@/context/EthersContext';
import { toast } from 'sonner';

const RegisterContractForm = () => {
    const { registerContract } = useContext(EthersContext)
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const rewardAmount = parseInt(e.target.rewardAmount.value);
        const value = parseInt(e.target.value.value);

        if (value < rewardAmount * 5) {
            toast.error("Initial balance must be at least 5x the reward amount!");
            return;
        }

        await registerContract(
            e.target.contractAddress.value,
            e.target.minStake.value,
            e.target.minRank.value,
            e.target.rewardAmount.value,
            e.target.value.value,
        );
    };

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>Register Contract</CardTitle>
                <CardDescription>
                    Register a new contract in the DERS system
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="contractAddress">Contract Address</Label>
                        <Input
                            id="contractAddress"
                            name="contractAddress"
                            placeholder="0x..."
                            required
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="minStake">Minimum Stake (ETH)</Label>
                        <Input
                            id="minStake"
                            name="minStake"
                            type="number"
                            step="0.0001"
                            min="0"
                            placeholder="0.1"
                            required
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="minRank">Minimum Rank</Label>
                        <Input
                            id="minRank"
                            name="minRank"
                            type="number"
                            min="0"
                            placeholder="1"
                            required
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rewardAmount">Reward Amount (ETH)</Label>
                        <Input
                            id="rewardAmount"
                            name="rewardAmount"
                            type="number"
                            step="0.0001"
                            min="0"
                            placeholder="0.5"
                            required
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="value">Initial Balance (ETH)</Label>
                        <Input
                            id="value"
                            name="value"
                            type="number"
                            step="0.0001"
                            min="0"
                            placeholder="2.5"
                            required
                            className="w-full"
                        />
                        <p className="text-sm text-gray-500">Must be at least 5x the reward amount</p>
                    </div>

                    <Button type="submit" className="w-full">
                        Register Contract
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default RegisterContractForm;