import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ethers } from 'ethers';
import { BigNoToInt } from '@/utils/convertions';

const ContractsList = ({ contracts }) => {
    const router = useRouter();

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-500 hover:bg-green-600';
            case 'InActive':
                return 'bg-yellow-500 hover:bg-yellow-600';
            case 'Paused':
                return 'bg-red-500 hover:bg-red-600';
            default:
                return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Registered Contracts</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">ID</TableHead>
                            <TableHead>Contract Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Balance (ETH)</TableHead>
                            <TableHead className="text-right">Reward (ETH)</TableHead>
                            <TableHead className="text-right">Severity</TableHead>
                            <TableHead className="text-right">Min Stake (ETH)</TableHead>
                            <TableHead className="text-right">Min Rank</TableHead>
                            <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contracts.map((contract) => (
                            <TableRow key={contract.contractId}>
                                <TableCell>{contract.contractId.toString()}</TableCell>
                                <TableCell className="font-mono">
                                    {formatAddress(contract.contractAddress)}
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(contract.status)}>
                                        {contract.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {contract.balance}
                                </TableCell>
                                <TableCell className="text-right">
                                    {contract.alertReward}
                                </TableCell>
                                <TableCell className="text-right">
                                    {contract.severity.toString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {contract.minStake}
                                </TableCell>
                                <TableCell className="text-right">
                                    {contract.minRank.toString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/contracts/${contract.contractId}`)}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default ContractsList;