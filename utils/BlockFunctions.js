import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { BigIntToDateString, BigIntToTimeDiff, BigNoToInt, getFileNameFromURL, HexToDateString } from "./convertions";
import { toast } from "sonner";
import { ethers } from "ethers";
import { baseAddress, contractAddress } from "./config";
import { abi } from "./abi";

const AlertStatus = {
    0: 'Pending',
    1: 'ValidatedUnResolved',
    2: 'ValidatedResolved',
    3: 'Rejected'
};

const ContractStatus = {
    0: 'UnRegistered',
    1: 'Active',
    2: 'InActive',
    3: 'Paused'
};

export const BlockFunctions = {
    storage: new ThirdwebStorage({
        clientId: "d38b4842e9d041746be46984e4baab53", // You can get one from dashboard settings
    }),
    getContract: () => {
        if (localStorage.getItem("blockchain")=="BASE"){
        const provider = new ethers.providers.JsonRpcProvider("https://base-mainnet.g.alchemy.com/v2/QEgC4Vsyb3fgPm90ENKlwx5X1-edSRT8")
        const contract = new ethers.Contract(baseAddress, abi, provider);
        return contract;
    }else{
            const provider = new ethers.providers.JsonRpcProvider('https://polygon-amoy.g.alchemy.com/v2/QEgC4Vsyb3fgPm90ENKlwx5X1-edSRT8');
            const contract = new ethers.Contract(contractAddress, abi, provider);
            return contract;
    }
    },
    getMetaMaskError: (error) => {
        return ". reason:- " + error?.error?.data?.message || error?.data?.message || error.message || ""
    },
    uploadToIPFS: async (files, descreption) => {
        try {
            const uri = await BlockFunctions.storage?.upload(
                {
                    descreption,
                    time: Date.now(),
                    files
                }
            )
            return uri;
        } catch (error) {
            toast.error("error uploading files to IPFS")
        }
    },
    getAlertIPFSData: async (uri) => {
        try {
            const data = await BlockFunctions.storage.downloadJSON(uri)
            return data
        } catch (error) {
            toast.error("failed to obtain alert data")
        }
    },
    getVote: async (alertId, voterAddress) => {
        try {
            const contract = BlockFunctions.getContract()
            const vote = await contract.getVote(alertId, voterAddress);
            return {
                stake: vote[0],
                support: vote[1],
                rank: vote[2],
                time: new Date(vote[3].toNumber() * 1000)
            };
        } catch (error) {
            console.log('Error getting vote:', error);
            toast.error(" Error getting data")
        }
    },

    getAlertStatus: async (alertId) => {
        try {
            const contract = BlockFunctions.getContract()
            const status = await contract.getAlertStatus(alertId);
            return AlertStatus[status];
        } catch (error) {
            console.log('Error getting alert status:', error);
            toast.error(" Error getting data")
        }
    },

    getContracts: async () => {
        try {
            const contract = BlockFunctions.getContract()
            const contracts = await contract.getContracts();
            return contracts.map(contract => ({
                contractId: BigNoToInt(contract[0]),
                status: ContractStatus[contract[1]],
                contractAddress: contract[2],
                balance: BigNoToInt(contract[3]),
                alertReward: BigNoToInt(contract[4]),
                severity: BigNoToInt(contract[5]),
                minStake: BigNoToInt(contract[6]),
                minRank: BigNoToInt(contract[7]),
                alerts: contract.alerts,
                resolvedAlerts: contract.resolvedAlerts,
            }));
        } catch (error) {
            console.log('Error getting contracts:', error);
            toast.error(" Error getting data")
        }
    },

    getUnresolvedAlerts: async (wallet) => {
        try {
            const contract = BlockFunctions.getContract()
            const alerts = await contract.getUnresolvedAlerts(wallet);

            return alerts.map(alert => ({
                alertId: alert[0],
                contractId: alert[1],
                creationTime: alert[2],
                status: AlertStatus[alert[3]],
                reward: alert[4],
                stake: alert[5],
                isHighPriority: alert[6],
                votersCount: alert[7],
                voted: !alert[8],
                uri: alert[9]
            }));
        } catch (error) {
            console.log('Error getting unresolved alerts:', error);
            toast.error(" Error getting data")
        }
    },

    getAlertData: async (id, wallet) => {
        try {
            console.log({id, wallet});
            const contract = BlockFunctions.getContract()
            const alert = await contract.getAlertDetails(id, wallet);
            let ipfsData = await BlockFunctions.storage.downloadJSON(alert.uri);
            let files = []
            ipfsData.files.map(uri => files.push({ uri, name: getFileNameFromURL(uri) }))
            return {
                id: BigNoToInt(alert[0]),
                contractId: BigNoToInt(alert[1]),
                creationTime: BigIntToDateString(alert[2]),
                status: AlertStatus[alert[3]],
                reward: BigNoToInt(alert[4]),
                stake: BigNoToInt(alert[5]),
                isHighPriority: alert[6],
                votersCount: BigNoToInt(alert[7]),
                voted: alert[8],
                uri: alert[9],
                minStake: "1",
                description: ipfsData.descreption,
                files
            };
        } catch (error) {
            console.log('Error getting alert data:', error);
            toast.error(" Error getting data")
        }
    },

    getAlertDataWithoutIPFS: async (id, wallet) => {
        try {
            const contract = BlockFunctions.getContract()
            const alert = await contract.getAlertDetails(id, wallet);
            const timestampMs = parseInt(alert[2]._hex, 16) * 1000
            const now = Date.now()
            const diff = now - timestampMs
            const resolvable = alert[6] ? diff >= 300000 : diff >= 86400000
            return {
                id: BigNoToInt(alert[0]),
                contractId: BigNoToInt(alert[1]),
                creationTime: BigIntToDateString(alert[2]),
                status: AlertStatus[alert[3]],
                reward: BigNoToInt(alert[4]),
                stake: BigNoToInt(alert[5]),
                isHighPriority: alert[6],
                votersCount: BigNoToInt(alert[7]),
                voted: alert[8],
                uri: alert[9],
                minStake: "1",
                resolvable
            };
        } catch (error) {
            console.log('Error getting unresolved alerts:', error);
            toast.error(" Error getting data")
        }
    },

    getContractMapping: async (contractId) => {
        try {
            const contract = BlockFunctions.getContract()
            const contractDetails = await contract.contractMapping(contractId);
            return {
                contractAddress: contractDetails[0],
                status: ContractStatus[contractDetails[1]],
                contractOwner: contractDetails[2],
                balance: contractDetails[3],
                severity: contractDetails[4],
                minStake: contractDetails[5],
                minRank: contractDetails[6],
                reward: contractDetails[7]
            };
        } catch (error) {
            console.log('Error getting contract mapping:', error);
            toast.error(" Error getting data")
        }
    },

    getUserContracts: async (wallet) => {
        try {
            const contract = BlockFunctions.getContract()
            const contracts = await contract.getUserContracts(wallet);
            console.log(contracts);
            return contracts.map(data => ({
                id: BigNoToInt(data.contractId),
                status: ContractStatus[data.status],
                address: data.contractAddress,
                balance: BigNoToInt(data.balance),
                reward: BigNoToInt(data.alertReward),
                severity: data.severity,
                minStake: BigNoToInt(data.minStake),
                minRank: BigNoToInt(data.minRank),
                alerts: data.alerts,
                resolvedAlerts: data.resolvedAlerts,
                aiPause: data.aiPause
            }));
        } catch (error) {
            console.log('Error getting contract mapping:', error);
            toast.error(" Error getting data")
        }
    },

    getAlertMapping: async (alertId) => {
        try {
            const contract = BlockFunctions.getContract()
            const alertDetails = await contract.alertMapping(alertId);
            return {
                contractId: alertDetails[0],
                creatorAddress: alertDetails[1],
                status: AlertStatus[alertDetails[2]],
                reward: alertDetails[3],
                stake: alertDetails[4],
                creationTime: new Date(alertDetails[5].toNumber() * 1000),
                totalPositiveStake: alertDetails[6],
                totalNegativeStake: alertDetails[7],
                totalPositiveRank: alertDetails[8],
                totalNegativeRank: alertDetails[9],
                isHighPriority: alertDetails[11]
            };
        } catch (error) {
            console.log('Error getting alert mapping:', error);
            toast.error(" Error getting data")
        }
    },

    getValidatorDetails: async (wallet) => {
        try {
            const contract = BlockFunctions.getContract()
            const validator = await contract.validatorMapping(wallet);
            let time = BigNoToInt(validator.lastCreationTime) == 0 ? "Never" : BigIntToTimeDiff(validator.lastCreationTime)
            return {
                id: BigNoToInt(validator.id),
                rank: BigNoToInt(validator.rank),
                totalClaimedReward: BigNoToInt(validator.totalClaimedReward),
                lastCreationTime: time
            };
        } catch (error) {
            console.log('Error getting validator mapping:', error);
            toast.error(" Error getting data")
        }
    },

    getAlertURI: async (alertId) => {
        try {
            const contract = BlockFunctions.getContract()
            const uri = await contract.alertURI(alertId);
            return uri;
        } catch (error) {
            console.log('Error getting alert URI:', error);
            toast.error(" Error getting data")
        }
    },

    getResolvedURI: async (alertId) => {
        try {
            const contract = BlockFunctions.getContract()
            const uri = await contract.resolvedURI(alertId);
            return uri;
        } catch (error) {
            console.log('Error getting resolved URI:', error);
            toast.error(" Error getting data")
        }
    },

    checkSeverity: async (contractId) => {
        try {
            const contract = BlockFunctions.getContract()
            const severity = await contract.checkSeverity(contractId);
            return severity;
        } catch (error) {
            console.log('Error checking severity:', error);
            toast.error(" Error getting data")
        }
    },

    isCritical: async (contractId) => {
        try {
            const contract = BlockFunctions.getContract()
            const critical = await contract.isCritical(contractId);
            return critical;
        } catch (error) {
            console.log('Error checking if contract is critical:', error);
            toast.error(" Error getting data")
        }
    },

    calculateRewardAndRank: async (validatorAddress, alertId) => {
        try {
            const contract = BlockFunctions.getContract()
            const [reward, rank] = await contract.calculateRewardAndRank(validatorAddress, alertId);
            return {
                reward,
                rank: rank.toNumber()
            };
        } catch (error) {
            console.log('Error calculating reward and rank:', error);
            toast.error(" Error getting data")
        }
    },

    calculateAllRewardAndRank: async (wallet) => {
        try {
            const contract = BlockFunctions.getContract()
            const [totalReward, totalRank] = await contract.calculateAllRewardAndRank(wallet);
            return {
                rewards: BigNoToInt(totalReward),
                rank: BigNoToInt(totalRank)
            };
        } catch (error) {
            console.log('Error calculating all rewards and ranks:', error);
            toast.error(" Error getting data")
        }
    },

    getUserUnClaimedList: async (wallet) => {
        try {
            const contract = BlockFunctions.getContract()
            const list = await contract.getUserUnClaimedList(wallet);
            return list;
        } catch (error) {
            console.log('Error calculating all rewards and ranks:', error);
            toast.error(" Error getting data")
        }
    }
}