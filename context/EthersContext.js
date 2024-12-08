"use client"
import Loading from "@/components/Components/Loading";
import { abi } from "@/utils/abi";
import { baseAddress, contractAddress } from "@/utils/config";
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
    const [contract, setContract] = useState(null)
    const [wallet, setWallet] = useState()
    const registerContract = async (address, minStake, minRank, rewardAmount, deposit) => {
        setIsLoading(true);
        try {
            const iface = new ethers.utils.Interface(abi)
            const data = iface.encodeFunctionData("registerContract", [
                address,
                minStake,
                minRank,
                rewardAmount
            ])
            const rawData = {
                network_name: window.localStorage.getItem("blockchain"),
                transaction: {
                    from: wallet,
                    to: window.localStorage.getItem("blockchain")=="BASE"?baseAddress:contractAddress,
                    value: deposit.toString(),
                    data
                }
            }
            const response = await executeRawTransaction(rawData);
 
            toast.success("Contract registered successfully");
            return response;
        } catch (error) {
            toast.error("Failed to register contract");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const createAlert = async (contractId, isHighPriority, stakeAmount, description, files) => {
        setIsLoading(true);
        try {
            const cid = "ipfs://QmUbfSnkM5XTrx74F2URUsqLKp7C41jEnWjU15zjsQC8BJ/0"
            const iface = new ethers.utils.Interface(abi)
            const data = iface.encodeFunctionData("createAlert", [
                cid,
                contractId,
                isHighPriority
            ])
            const rawData = {
                network_name: window.localStorage.getItem("blockchain"),
                transaction: {
                    from: wallet,
                    to: window.localStorage.getItem("blockchain") == "BASE" ? baseAddress : contractAddress,
                    value: stakeAmount.toString(),
                    data
                }
            }
            const response = await executeRawTransaction(rawData);
            toast.success("Alert created successfully");
            return response;
        } catch (error) {
            toast.error("Failed to create alert");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const vote = async (alertId, support, stakeAmount) => {
        setIsLoading(true);
        try {
            const iface = new ethers.utils.Interface(abi)
            const data = iface.encodeFunctionData("vote", [alertId, support])
            const rawData = {
                network_name: window.localStorage.getItem("blockchain"),
                transaction: {
                    from: wallet,
                    to: window.localStorage.getItem("blockchain")=="BASE"?baseAddress:contractAddress,
                    value: stakeAmount.toString(),
                    data
                }
            }
            const response = await executeRawTransaction(rawData);
            toast.success("Vote submitted successfully");
            window.location.reload()
        } catch (error) {
            console.log(error);
            toast.error("Failed to submit vote");
        } finally {
            setIsLoading(false);
        }
    };

    const claimReward = async () => {
        setIsLoading(true);
        try {
            const iface = new ethers.utils.Interface(abi)
            const data = iface.encodeFunctionData("claimReward", [])
            const rawData = {
                network_name: window.localStorage.getItem("blockchain"),
                transaction: {
                    from: wallet,
                    to: window.localStorage.getItem("blockchain")=="BASE"?baseAddress:contractAddress,
                    value: "0",
                    data
                }
            }
            const response = await executeRawTransaction(rawData);
            toast.success("Rewards claimed successfully");
            window.location.reload();
            return response;
        } catch (error) {
            toast.error("Failed to claim rewards");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const withdrawBalance = async (contractId) => {
        setIsLoading(true);
        try {
            const iface = new ethers.utils.Interface(abi)
            const data = iface.encodeFunctionData("withdrawbalance", [contractId])
            const rawData = {
                network_name: window.localStorage.getItem("blockchain"),
                transaction: {
                    from: wallet,
                    to: window.localStorage.getItem("blockchain")=="BASE"?baseAddress:contractAddress,
                    value: "0",
                    data
                }
            }
            const response = await executeRawTransaction(rawData);
            toast.success("Balance withdrawn successfully");
            return response;
        } catch (error) {
            toast.error("Failed to withdraw balance");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const declareAlertResult = async (alertId, accept) => {
        setIsLoading(true);
        try {
            const iface = new ethers.utils.Interface(abi)
            const data = iface.encodeFunctionData("declareAlertResult", [alertId, accept])
            const rawData = {
                network_name: window.localStorage.getItem("blockchain"),
                transaction: {
                    from: wallet,
                    to: window.localStorage.getItem("blockchain")=="BASE"?baseAddress:contractAddress,
                    value: "0",
                    data
                }
            }
            const response = await executeRawTransaction(rawData);
            toast.success("Alert result declared successfully");
            window.location.reload()
        } catch (error) {
            toast.error("Failed to declare alert result");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const pauseContract = async (contractId) => {
        setIsLoading(true);
        try {
            const iface = new ethers.utils.Interface(abi)
            const data = iface.encodeFunctionData("puaseContract", [contractId])
            const rawData = {
                network_name: window.localStorage.getItem("blockchain"),
                transaction: {
                    from: wallet,
                    to: window.localStorage.getItem("blockchain")=="BASE"?baseAddress:contractAddress,
                    value: "0",
                    data
                }
            }
            const response = await executeRawTransaction(rawData);
            toast.success("Contract paused successfully");
            return response;
        } catch (error) {
            toast.error("Failed to pause contract");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const resolveAlert = async (alertId, files, description) => {
        setIsLoading(true);
        try {
            const cid = "ipfs://QmUbfSnkM5XTrx74F2URUsqLKp7C41jEnWjU15zjsQC8BJ/0"
            const iface = new ethers.utils.Interface(abi)
            const data = iface.encodeFunctionData("resolveAlert", [alertId, cid])
            const rawData = {
                network_name: window.localStorage.getItem("blockchain"),
                transaction: {
                    from: wallet,
                    to: window.localStorage.getItem("blockchain")=="BASE"?baseAddress:contractAddress,
                    value: "0",
                    data
                }
            }
            const response = await executeRawTransaction(rawData);
            toast.success("Alert resolved successfully");
            return response;
        } catch (error) {
            toast.error("Failed to resolve alert");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const increaseContractBalance = async (contractId, amount) => {
        setIsLoading(true);
        try {
            const iface = new ethers.utils.Interface(abi)
            const data = iface.encodeFunctionData("increaseContractBalance", [contractId])
            const rawData = {
                network_name: window.localStorage.getItem("blockchain"),
                transaction: {
                    from: wallet,
                    to: window.localStorage.getItem("blockchain")=="BASE"?baseAddress:contractAddress,
                    value: amount.toString(),
                    data
                }
            }
            const response = await executeRawTransaction(rawData);
            toast.success("Contract balance increased successfully");
            return response;
        } catch (error) {
            toast.error("Failed to increase contract balance");
            console.log(error);
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
            console.log(error);
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
                contract,
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
                setWallet,
            }}
        >{children}{isLoading && <Loading />}</EthersContext.Provider>
    )
}