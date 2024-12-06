"use client"
import React, { useState, useEffect, useContext } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EthersContext } from '@/context/EthersContext';
import { BlockFunctions } from '@/utils/BlockFunctions';
import CreateAlertModal from '@/components/Components/CreateAlertModal';
import OwnerAlertTable from '@/components/Components/OwnerAlertTable';

const ContractStatusMap = {
    0: "Unregistered",
    1: "Active",
    2: "Inactive",
    3: "Paused"
};


const ContractPage = ({ params }) => {
    const { setIsLoading } = useContext(EthersContext)
    const [contract, setContract] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [validatedAlert, setValidatedAlert] = useState([]);
    const paramData = React.use(params);
    const { id } = paramData;

    const initiator = async () => {
        try {
            setIsLoading(true);
            const contractDetails = await BlockFunctions.getContracts();
            const targetContract = contractDetails[id];
            console.log({ targetContract });
            setContract(targetContract);
            if (targetContract.alerts) targetContract.alerts.map(async (alert) => {
                const data = await BlockFunctions.getAlertDataWithoutIPFS(alert)
                console.log(data);
                if (data) setAlerts([data, ...alerts])
            })
            if (targetContract.resolvedAlerts) targetContract.resolvedAlerts.map(async (alert) => {
                const data = await BlockFunctions.getAlertDataWithoutIPFS(alert)
                if (data) setValidatedAlert([data, ...validatedAlert])
            })
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initiator();
    }, [id]);


    if (!contract) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-6">
                <Alert variant="destructive">
                    <AlertDescription>
                        Contract not found or failed to load
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>Contract Details</CardTitle>
                                <CardDescription>Contract ID: {id}</CardDescription>
                            </div>
                            <Badge variant={contract.status === 1 ? "success" : "secondary"}>
                                {ContractStatusMap[contract.status]}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Contract Address</h4>
                                <p className="text-sm text-gray-500 break-all">{contract.contractAddress}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Balance</h4>
                                <p className="text-sm text-gray-500">
                                    {contract.balance} Wie
                                </p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Alert Reward</h4>
                                <p className="text-sm text-gray-500">
                                    {contract.alertReward} Wie
                                </p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Severity</h4>
                                <p className="text-sm text-gray-500">{contract.severity}/10</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Minimum Stake</h4>
                                <p className="text-sm text-gray-500">
                                    {contract.minStake} Wie
                                </p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Minimum Rank</h4>
                                <p className="text-sm text-gray-500">{contract.minRank}</p>
                            </div>
                        </div>
                        <div className="pt-4 flex w-full justify-center">
                            <CreateAlertModal contractId={id} contractData={contract} />
                        </div>
                    </CardContent>
                </Card>

                <OwnerAlertTable heading="Active Alerts" subHeading="List of all votable alerts associated with this contract" alerts={alerts} />
                <OwnerAlertTable heading="Previous Alerts" subHeading="List of all alerts associated with this contract, which are not active" alerts={validatedAlert} validated/>

            </div>
        </div>
    );
};

export default ContractPage;