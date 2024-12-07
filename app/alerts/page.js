"use client"
import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BlockFunctions } from '@/utils/BlockFunctions';
import { EthersContext } from '@/context/EthersContext';
import { BigNoToInt } from '@/utils/convertions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useOkto } from 'okto-sdk-react';

const UnresolvedAlerts = () => {
    const {setIsLoading, wallet} = useContext(EthersContext)
    const [alerts, setAlerts] = useState([])
    const initiator = async()=>{
        setIsLoading(true)
        console.log({wallet});
        const res = await BlockFunctions.getUnresolvedAlerts(wallet)
        setAlerts(res)
        setIsLoading(false)
    }
    useEffect(() => {
      initiator()
    }, [wallet])
    return (
        <div className="w-full flex justify-center">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>Unresolved Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Alert ID</TableHead>
                                <TableHead className="hidden sm:table-cell">Contract ID</TableHead>
                                <TableHead className="hidden sm:table-cell">Reward (ETH)</TableHead>
                                <TableHead className="hidden sm:table-cell text-center">Voters</TableHead>
                                <TableHead className="text-center" >Priority</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts && alerts.map((alert) => (
                                <TableRow key={alert.alertId}>
                                    <TableCell className="font-medium">
                                        #{BigNoToInt(alert.alertId)}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {BigNoToInt(alert.contractId)}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {BigNoToInt(alert.reward)}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-center">
                                        {BigNoToInt(alert.votersCount)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={alert.isHighPriority ? "destructive" : "secondary"}>
                                            {alert.isHighPriority ? "High" : "Normal"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/alerts/${alert.alertId}`}>
                                            <Button size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!alerts || alerts.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        No unresolved alerts found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default UnresolvedAlerts;