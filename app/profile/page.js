"use client"
import { useContext, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, AlertCircle, Building2, ExternalLink } from 'lucide-react';
import { EthersContext } from '@/context/EthersContext';
import { BlockFunctions } from '@/utils/BlockFunctions';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const validatorData = {
    rank: "75",
    totalClaimedReward: "5.5",
    lastCreationTime: "11/28/2024"
};

const rewardData = {
    rewards: "2.35",
    rank: "+12",
    unclaimedAlerts: []
}

export default function UserProfile() {
    const pathname = usePathname();
    const { setIsLoading, claimReward } = useContext(EthersContext)
    const [validator, setValidator] = useState(validatorData)
    const [reward, setReward] = useState(rewardData)
    const [contracts, setContracts] = useState([])

    const intiator = async () => {
        setIsLoading(true)
        const vData = await BlockFunctions.getValidatorDetails()
        if (vData) setValidator(vData);
        const rData = await BlockFunctions.calculateAllRewardAndRank();
        const unClaimedList = await BlockFunctions.getUserUnClaimedList();
        setReward({
            rewards: rData.rewards,
            rank: rData.rank,
            unclaimedAlerts: unClaimedList
        })
        const contracts = await BlockFunctions.getUserContracts();
        console.log({contracts});
        setContracts(contracts)
        setIsLoading(false)
    }

    useEffect(() => {
        intiator()
    }, [])

    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-6 w-6" />
                        Validator Profile
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Current Rank:</span>
                            <Badge variant="secondary" className="text-md">{validator.rank}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total Claimed Rewards:</span>
                            <span className="font-medium">{validator.totalClaimedReward} ETH</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Last Alert Created:</span>
                            <span className="font-medium">{validator.lastCreationTime}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-6 w-6" />
                        Unclaimed Rewards
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Pending Reward:</span>
                                <span className="font-medium">{reward.rewards} ETH</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Rank Change:</span>
                                <Badge variant="success" className="text-md">
                                    {reward.rank}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Unclaimed Alerts:</span>
                                <Badge variant="secondary" className="text-md">{reward.unclaimedAlerts.length}</Badge>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            onClick={claimReward}
                            disabled={parseInt(reward.rewards) == 0}
                        >
                            Claim Rewards
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-6 w-6" />
                        Your Contracts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {contracts.map((contract) => (
                            <div key={contract.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium truncate">{contract.address}</span>
                                    <Badge
                                        variant={contract.status === "Active" ? "success" : "secondary"}
                                    >
                                        {contract.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                    <div>
                                        <span className="text-muted-foreground">Balance: </span>
                                        <span className="font-medium">{contract.balance} ETH</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Reward: </span>
                                        <span className="font-medium">{contract.alertReward} ETH</span>
                                    </div>
                                    </div>
                                    <div>
                                    <div>
                                        <span className="text-muted-foreground">Min Stake: </span>
                                        <span className="font-medium">{contract.minStake} ETH</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Min Rank: </span>
                                        <span className="font-medium">{contract.minRank}</span>
                                    </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Link href={`${pathname}/contracts/${contract.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                View
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}