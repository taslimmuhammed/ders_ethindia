"use client"
import Loading from "@/components/Components/Loading";
import { abi } from "@/utils/abi";
import { BlockFunctions } from "@/utils/BlockFunctions";
import { contractAddress } from "@/utils/config";
import { stringToBigInt } from "@/utils/convertions";
import { ethers } from "ethers";
import React, { createContext, useEffect, useState } from "react";
import { toast } from 'sonner';

export const EthersContext = createContext(null);

export default function Ethers({ children }) {
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const [contract, setContract] = useState(null)
    const registerContract = async (contractAddress,minStake,minRank,rewardAmount, deposit) => {
        setIsLoading(true);
        try {
            const contract = getContract()
            const rewardAmountWei = stringToBigInt(rewardAmount.toString());
            const tx = await contract.registerContract(
                contractAddress,
                stringToBigInt(minStake.toString()),
                minRank,
                rewardAmountWei,
                { value: stringToBigInt(deposit) }
            );
            const receipt = await tx.wait();
            toast.success("Contract registered successfully");
            return receipt;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to register contract"+errorMessage);
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new alert
    const createAlert = async (contractId,isHighPriority,stakeAmount, description, files) => {
        setIsLoading(true);
        try {
            // const cid = await BlockFunctions.uploadToIPFS(files, contractId, isHighPriority, stakeAmount, description, address)
            // console.log({ cid })
            // if (cid == null) throw new Error("Something went wrong!");
            const cid = "ipfs://QmUbfSnkM5XTrx74F2URUsqLKp7C41jEnWjU15zjsQC8BJ/0"
            const contract = getContract()
            
            const tx = await contract.createAlert(
                cid,
                contractId,
                isHighPriority,
                { value: stringToBigInt(stakeAmount.toString()) }
            );
            const receipt = await tx.wait();
            toast.success("Alert created successfully");
            return receipt;
        } catch (error) {
            //console.log("my error ", error);
            const errorMessage = BlockFunctions.getMetaMaskError(error) ;
            toast.error(`Failed to create alert ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Vote on an alert
    const vote = async (alertId,support,stakeAmount) => {
        setIsLoading(true);
        try {
            const contract = getContract()
            console.log(alertId, support, stakeAmount);
            const tx = await contract.vote(
                stringToBigInt(alertId),
                support,
                { value: stringToBigInt(stakeAmount.toString()) }
            );
            await tx.wait();
            toast.success("Vote submitted successfully");
            window.location.reload()
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to submit vote"+ errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Claim rewards
    const claimReward = async () => {
        setIsLoading(true);
        try {
            const contract = getContract();
            const tx = await contract.claimReward();
            const receipt = await tx.wait();
            toast.success("Rewards claimed successfully");
            window.location.reload();
            return receipt;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to claim rewards"+ errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Withdraw balance
    const withdrawBalance = async (contractId) => {
        setIsLoading(true);
        try {
            const contract = getContract()
            const tx = await contract.withdrawbalance(contractId);
            const receipt = await tx.wait();
            toast.success("Balance withdrawn successfully");
            return receipt;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to withdraw balance"+ errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Declare alert result
    const declareAlertResult = async(alertId,accept) => {
        setIsLoading(true);
        try {
            const contract = getContract()
            const tx = await contract.declareAlertResult(alertId, accept);
            const receipt = await tx.wait();
            toast.success("Alert result declared successfully");
            window.location.reload()
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to declare alert result"+ errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Pause contract
    const pauseContract = async (contractId) => {
        setIsLoading(true);
        try {
            const contract = getContract()
            const tx = await contract.puaseContract(contractId);
            const receipt = await tx.wait();
            toast.success("Contract paused successfully");
            return receipt;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to pause contract"+ errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Resolve alert
    const resolveAlert = async (alertId,files, description) => {
        setIsLoading(true);
        try {
            // const cid = await BlockFunctions.uploadToIPFS(files, description)
            // console.log({ cid })
            // if (cid == null) throw new Error("Something went wrong!");
            const cid = "ipfs://QmUbfSnkM5XTrx74F2URUsqLKp7C41jEnWjU15zjsQC8BJ/0"
            const contract = getContract()
            const tx = await contract.resolveAlert(alertId, cid);
            const receipt = await tx.wait();
            toast.success("Alert resolved successfully");
            return receipt;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to resolve alert"+ errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Increase contract balance
    const increaseContractBalance = async (contractId,amount) => {
        setIsLoading(true);
        try {
            const contract = getContract()
            const tx = await contract.increaseContractBalance(
                contractId,
                { value: stringToBigInt(amount.toString()) }
            );
            const receipt = await tx.wait();
            toast.success("Contract balance increased successfully");
            return receipt;
        } catch (error) {
            const errorMessage = BlockFunctions.getMetaMaskError(error);
            toast.error("Failed to increase contract balance"+ errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    const getWallet = async () => {
        try {
            if (address == null) {
                const accounts = await ethereum.request({ method: "eth_accounts" });
                const account = accounts[0];
                return account;
            } else return currentAccount;
        } catch (e) {
            alert(e);
        }
    };

    const getContract = () => {
            if (contract == null) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(contractAddress, abi, signer);
                setContract(contract);
                return contract;
            } else return contract;
    };
    const checkIfWalletIsConnect = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setAddress(accounts[0]);
            } else {
                toast.error("please connect wallet to use our services")
                navigate('/')
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnect();
        getContract()
    }, []);
    return (
        <EthersContext.Provider
            value={{
                address,
                setAddress,
                contract,
                isLoading,
                setIsLoading,
                getContract,
                registerContract,
                createAlert,
                vote,
                claimReward,
                withdrawBalance,
                declareAlertResult,
                pauseContract,
                resolveAlert,
                increaseContractBalance
            }}
        >{children}{isLoading && <Loading/>} </EthersContext.Provider>
    )
}