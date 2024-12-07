"use client"
import Loading from "@/components/Components/Loading";
import { abi } from "@/utils/abi";
import { BlockFunctions } from "@/utils/BlockFunctions";
import { contractAddress } from "@/utils/config";
import { stringToBigInt } from "@/utils/convertions";
import { ethers } from "ethers";
import { useOkto } from "okto-sdk-react";
import React, { createContext, useEffect, useState } from "react";
import { toast } from 'sonner';

export const EthersContext = createContext(null);

export default function Ethers({ children }) {
    const { getWallets, isLoggedIn, executeRawTransaction } = useOkto()
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const [wallet, setWallet] = useState()

    const registerContract = async (contractAddress, minStake, minRank, rewardAmount, deposit) => {
        setIsLoading(true);
        try {
            const rawData = {
                network_name: "POLYGON_TESTNET_AMOY",
                transaction: {
                    to: contractAddress,
                    from:wallet,
                    data:"jn",
                    value: stringToBigInt(deposit)
                }
            };
            const response = await executeRawTransaction(rawData);
            toast.success("Contract registered successfully");
            return response;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to register contract" + errorMessage);
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const createAlert = async (contractId, isHighPriority, stakeAmount, description, files) => {
        setIsLoading(true);
        try {
            const cid = "ipfs://QmUbfSnkM5XTrx74F2URUsqLKp7C41jEnWjU15zjsQC8BJ/0"
            const rawData = {
                network_name: "POLYGON_TESTNET_AMOY",
                transaction: {
                    to: contractAddress,
                    data: contract.interface.encodeFunctionData("createAlert", [
                        cid,
                        contractId,
                        isHighPriority
                    ]),
                    value: stringToBigInt(stakeAmount.toString())
                }
            };
            const response = await executeRawTransaction(rawData);
            toast.success("Alert created successfully");
            return response;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error(`Failed to create alert ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const vote = async (alertId, support, stakeAmount) => {
        setIsLoading(true);
        try {
            const rawData = {
                network_name: "POLYGON_TESTNET_AMOY",
                transaction: {
                    to: contractAddress,
                    data: contract.interface.encodeFunctionData("vote", [
                        stringToBigInt(alertId),
                        support
                    ]),
                    value: stringToBigInt(stakeAmount.toString())
                }
            };
            await executeRawTransaction(rawData);
            toast.success("Vote submitted successfully");
            window.location.reload()
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to submit vote" + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const claimReward = async () => {
        setIsLoading(true);
        try {
            const rawData = {
                network_name: "POLYGON_TESTNET_AMOY",
                transaction: {
                    to: contractAddress,
                    data: contract.interface.encodeFunctionData("claimReward", [])
                }
            };
            const response = await executeRawTransaction(rawData);
            toast.success("Rewards claimed successfully");
            window.location.reload();
            return response;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to claim rewards" + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const withdrawBalance = async (contractId) => {
        setIsLoading(true);
        try {
            const rawData = {
                network_name: "POLYGON_TESTNET_AMOY",
                transaction: {
                    to: contractAddress,
                    data: contract.interface.encodeFunctionData("withdrawbalance", [contractId])
                }
            };
            const response = await executeRawTransaction(rawData);
            toast.success("Balance withdrawn successfully");
            return response;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to withdraw balance" + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const declareAlertResult = async (alertId, accept) => {
        setIsLoading(true);
        try {
            const rawData = {
                network_name: "POLYGON_TESTNET_AMOY",
                transaction: {
                    to: contractAddress,
                    data: contract.interface.encodeFunctionData("declareAlertResult", [alertId, accept])
                }
            };
            await executeRawTransaction(rawData);
            toast.success("Alert result declared successfully");
            window.location.reload()
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to declare alert result" + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const pauseContract = async (contractId) => {
        setIsLoading(true);
        try {
            const rawData = {
                network_name: "POLYGON_TESTNET_AMOY",
                transaction: {
                    to: contractAddress,
                    data: contract.interface.encodeFunctionData("puaseContract", [contractId])
                }
            };
            const response = await executeRawTransaction(rawData);
            toast.success("Contract paused successfully");
            return response;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to pause contract" + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const resolveAlert = async (alertId, files, description) => {
        setIsLoading(true);
        try {
            const cid = "ipfs://QmUbfSnkM5XTrx74F2URUsqLKp7C41jEnWjU15zjsQC8BJ/0"
            const rawData = {
                network_name: "POLYGON_TESTNET_AMOY",
                transaction: {
                    to: contractAddress,
                    data: contract.interface.encodeFunctionData("resolveAlert", [alertId, cid])
                }
            };
            const response = await executeRawTransaction(rawData);
            toast.success("Alert resolved successfully");
            return response;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to resolve alert" + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const increaseContractBalance = async (contractId, amount) => {
        setIsLoading(true);
        try {
            const rawData = {
                network_name: "POLYGON_TESTNET_AMOY",
                transaction: {
                    to: contractAddress,
                    data: contract.interface.encodeFunctionData("increaseContractBalance", [contractId]),
                    value: stringToBigInt(amount.toString())
                }
            };
            const response = await executeRawTransaction(rawData);
            toast.success("Contract balance increased successfully");
            return response;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to increase contract balance" + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const checkIfWalletIsConnect = async () => {
        try {
            const wallets = await getWallets()
            console.log(wallets);
            setWallet(wallets.wallets[0].address)
        } catch (error) {
            console.log("Failed to connect wallet:", error);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnect();
    }, [isLoggedIn]);

    return (
        <EthersContext.Provider
            value={{
                address,
                setAddress,
                isLoading,
                setIsLoading,
                registerContract,
                createAlert,
                vote,
                claimReward,
                withdrawBalance,
                declareAlertResult,
                pauseContract,
                resolveAlert,
                increaseContractBalance,
                wallet,
                setWallet
            }}
        >{children}{isLoading && <Loading />} </EthersContext.Provider>
    )
}

