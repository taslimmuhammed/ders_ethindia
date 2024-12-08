"use client"
import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Users, Timer, Coins, AlertTriangle, FileText, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EthersContext } from '@/context/EthersContext';
import { BlockFunctions } from '@/utils/BlockFunctions';
import Link from 'next/link';
import { BigIntToDateString } from '@/utils/convertions';
const data = {
    id: 1,
    contractId: 123,
    status: "Pending",
    reward: "0.5 ETH",
    stake: "0.1 ETH",
    minStake: "1", // Minimum stake required in ETH
    creationTime: "2024-03-15T10:00:00",
    votersCount: 12,
    isHighPriority: true,
    description: "Potential vulnerability detected in smart contract function...",
    files: [
        { name: "code-snippet.sol", uri: "" },
        { name: "proof-of-concept.js", uri: "" }
    ]
};
const AlertDetails = ({ params }) => {
    const [stakeAmount, setStakeAmount] = useState('');
    const [error, setError] = useState('');
    const [alertData, setAlertData] = useState(data)
    const { setIsLoading, vote, wallet } = useContext(EthersContext)
    const paramData = React.use(params);
    const { id } = paramData;
    const intiator = async()=>{
        setIsLoading(true)
        let data = await BlockFunctions.getAlertData(id, wallet);
        if(data) setAlertData(data)
        setIsLoading(false)
    }
    useEffect(() => {
        intiator()
    }, [wallet])
    
    const validateStake = (amount) => {
        if (!amount || amount === '' || isNaN(amount) || parseFloat(amount) <= 0 || parseFloat(amount) < parseFloat(alertData.minStake)) {
            setError(`Minimum stake required is ${alertData.minStake} ETH`);
            return false;
        }
        setError('');
        return true;
    };

    const handleVote = (support) => {
        if (!validateStake(stakeAmount)) return;
        vote(id, support, stakeAmount)
    };

    const getTimeAgo = (timestamp) => {
        const date = new Date(timestamp/1000);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        return `${diffInHours} hours ago`;
    };


    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl mb-2">Alert #{alertData.id}</CardTitle>
                            <CardDescription>Contract ID: {alertData.contractId}</CardDescription>
                        </div>
                        <Badge variant={alertData.isHighPriority ? "destructive" : "secondary"}>
                            {alertData.isHighPriority ? "High Priority" : "Normal Priority"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4" />
                                <span className="font-medium">Reward: {alertData.reward}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4" />
                                <span>Created {alertData.creationTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{alertData.votersCount} validators voted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                <span className="font-medium">Minimum Stake: {alertData.minStake} ETH</span>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="font-medium mb-3">Description</h3>
                            <p className="text-gray-700">{alertData.description}</p>
                        </div>

                        <div>
                            <h3 className="font-medium mb-3">Files</h3>
                            <div className="space-y-2">
                                {alertData.files.map((file, index) => (
                                    <Link href={file.uri} key={index} target='blank'>
                                    <div
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                    >
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <div className="font-medium">{file.name}</div>
                                            {/* <div className="text-sm text-gray-500">{file.size}</div> */}
                                        </div>
                                    </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {!alertData.voted && alertData.status === "Pending" && (
                            <div className="space-y-6">
                                <Separator />
                                <div className="space-y-4">
                                    <Label htmlFor="stake">Enter your stake amount (ETH)</Label>
                                    <Input
                                        id="stake"
                                        type="number"
                                        step="0.000001"
                                        min={alertData.minStake}
                                        placeholder={`Min. ${alertData.minStake} ETH`}
                                        value={stakeAmount}
                                        onChange={(e) => setStakeAmount(e.target.value)}
                                        className="max-w-xs"
                                    />
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <Button
                                        onClick={() => handleVote(true)}
                                        className="w-32"
                                        variant="default"
                                    >
                                        <ThumbsUp className="w-4 h-4 mr-2" />
                                        Support
                                    </Button>
                                    <Button
                                        onClick={() => handleVote(false)}
                                        className="w-32"
                                        variant="destructive"
                                    >
                                        <ThumbsDown className="w-4 h-4 mr-2" />
                                        Oppose
                                    </Button>
                                </div>
                            </div>
                        )}

                        {alertData.voted && (
                            <Alert className="bg-green-50">
                                <AlertTitle>Thank you for voting!</AlertTitle>
                                <AlertDescription>
                                    Your vote has been recorded with a stake of {stakeAmount} ETH. You can claim your rewards once the alert is resolved.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AlertDetails;