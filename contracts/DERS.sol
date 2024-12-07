// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

struct Alert {
    uint256 contractId;
    address creatorAddress;
    AlertStatus status;
    uint256 reward;
    uint256 stake;
    uint256 creationTime;
    uint256 totalPositiveStake;
    uint256 totalNegetiveStake;
    uint256 totalPositiveRank;
    uint256 totalNegetiveRank;
    address[] validatorsList;
    bool isHighPriority;
    mapping(address => Vote) voteMap;
}
struct RAlert {
    uint256 alertId;
    uint256 contractId;
    uint256 creationTime;
    AlertStatus status;
    uint256 reward;
    uint256 stake;
    bool isHighPriority;
    uint256 votersCount;
    bool voted;
    string uri;
}
struct Vote {
    uint256 stake;
    bool support;
    uint256 rank;
    uint256 time;
}
enum AlertStatus {
    Pending,
    ValidatedUnResolved,
    ValidatedResolved,
    Rejected
}
struct Validator {
    uint256 id;
    uint256 rank;
    uint256 rankCounter;
    uint256 totalClaimedReward;
    uint256 lastCreationTime;
    uint256[] uncliamedAlertList;
    uint256[] contracts;
}
struct Contract {
    address contractAddress;
    ContractStatus status;
    address contractOwner;
    uint256 balance;
    uint256 severity;
    uint256 minStake;
    uint256 minRank;
    uint256 reward; // will be distributed upto 2x
    uint256[] alerts;
    uint256[] resolvedAlerts;
    bool aiPause;
}
enum ContractStatus {
    UnRegisterd,
    Active,
    InActive, //when the money is not available
    Paused
}
struct RContract {
    uint256 contractId;
    ContractStatus status;
    address contractAddress;
    uint256 balance;
    uint256 alertReward;
    uint256 severity;
    uint256 minStake;
    uint256 minRank;
    uint256[] alerts;
    uint256[] resolvedAlerts;
    bool aiPause;
}

interface ISeverityChecker {
    function checkSeverity(uint256 contractId) external view returns (uint256);

    function isCritical(uint256 contractId) external view returns (bool);
}

contract DERS is ISeverityChecker {
    uint256 minVotingStake = 1 wei;
    uint256 minAlertReward = 1 wei;
    uint256 MAX_SEVERITY = 10;
    address owner;
    //validation critierias
    uint256 rankThreshold = 1;
    uint256 highPriorityRankThreshold = 1;
    uint256 stakeThreshold = 20;
    uint256 highPriorityStakeThreshold = 10;

    uint256 totalValidatorStake;
    uint256 activeValidatorCount;
    uint256 alertCount;
    uint256 contractCount;

    address[] validators;
    uint256[] unResolvedAlerts;
    mapping(uint256 => Contract) public contractMapping;
    mapping(uint256 => Alert) public alertMapping;
    mapping(uint256 => string) public alertURI;
    mapping(uint256 => string) public resolvedURI;
    mapping(address => Validator) public validatorMapping;

    event AlertCreated(
        uint256 id,
        uint256 contractid,
        address contractAddress,
        address creator,
        bool highPriority
    );
    event AlertResolved(
        uint256 id,
        uint256 contractId,
        AlertStatus status
    );
    event ValidatorRegistered(uint256 id, address validator);
    event ContractRegistered(
        uint256 id,
        address contractAddress,
        address contractOwner,
        uint256 stake,
        uint256 minStake,
        uint256 minRank,
        uint256 minReward
    );

    constructor() {
        owner = msg.sender;
        validatorMapping[msg.sender].rank = 10;
    }

    function registerContract(
        address _contractAddress,
        uint256 _minStake,
        uint256 _minRank,
        uint256 _rewardAmount
    ) external payable returns (uint256) {
        require(
            _rewardAmount >= minAlertReward,
            "The minimum reward less than defined value"
        );
        require(
            msg.value >= _rewardAmount * 5,
            "The amount send is less than minimum required value"
        );
        uint256 index = contractCount++;
        Contract storage _contract = contractMapping[index];
        _contract.contractAddress = _contractAddress;
        _contract.status = ContractStatus.Active;
        _contract.contractOwner = msg.sender;
        _contract.severity = 0;
        _contract.minStake = _minStake;
        _contract.minRank = _minRank;
        _contract.reward = _rewardAmount;
        _contract.balance = msg.value;
        validatorMapping[msg.sender].contracts.push(index);
        emit ContractRegistered(
            index,
            _contractAddress,
            msg.sender,
            msg.value,
            _minStake,
            _minRank,
            _rewardAmount
        );
        return index;
    }

    function createAlert(
        string memory _uri,
        uint256 _contractId,
        bool _isHighPriority
    ) external payable {
        //change look for previous unresolved case
        Validator storage _validator = validatorMapping[msg.sender];
        Contract storage _contract = contractMapping[_contractId];
        uint256 requiredStake = _contract.minStake;
        uint256 requiredRank = _contract.minRank;
        uint256 alertReward = _contract.reward;

        if (_isHighPriority) {
            requiredStake = _contract.minStake * 2;
            requiredRank = _contract.minRank * 2;
            alertReward = _contract.reward * 2;
        }
        require(
            msg.value >= requiredStake,
            "your stake is less than the contract requirement"
        );
        require(
            _validator.rank >= requiredRank,
            "your rank is less than the contract requirement"
        );
        require(
            _contract.balance >= alertReward,
            "the contract doesn't have enough balance"
        );
        require(
            block.timestamp - _validator.lastCreationTime >= 1 days,
            "You can't create more than one alert in one day"
        );
        require(_contractId < contractCount, "The contract does'nt exist");
        _validator.lastCreationTime = block.timestamp;
        // creating new alert
        uint256 index = alertCount++;
        alertURI[index] = _uri;
        Alert storage _alert = alertMapping[index];
        _alert.contractId = _contractId;
        _alert.creatorAddress = msg.sender;
        _alert.creationTime = block.timestamp;
        _alert.reward = alertReward;
        _contract.balance -= alertReward;
        _alert.status = AlertStatus.Pending;
        _contract.alerts.push(index);
        unResolvedAlerts.push(index);
        _alert.isHighPriority = _isHighPriority;
        vote(index, true);
        emit AlertCreated(
            index,
            _contractId,
            _contract.contractAddress,
            msg.sender,
            _isHighPriority
        );
    }

    function vote(uint256 _alertId, bool _support) public payable {
        Alert storage _alert = alertMapping[_alertId];
        Validator storage _validator = validatorMapping[msg.sender];
        require(
            _alert.status == AlertStatus.Pending,
            "This alert voting is over"
        );
        require(_alert.voteMap[msg.sender].stake == 0, "Already voted");
        require(
            msg.value >= minVotingStake,
            "The stake can't bet less than defined"
        );
        _alert.validatorsList.push(msg.sender);
        _alert.voteMap[msg.sender] = Vote(
            msg.value,
            _support,
            _validator.rank,
            block.timestamp
        );
        if (_support) {
            _alert.totalPositiveStake += msg.value;
            _alert.totalPositiveRank += _validator.rank;
        } else {
            _alert.totalNegetiveStake += msg.value;
            _alert.totalNegetiveRank += _validator.rank;
        }
        validatorMapping[msg.sender].uncliamedAlertList.push(_alertId);
        AlertStatus _consensus = checkConsensusReached(_alert);
        if (_consensus == AlertStatus.ValidatedUnResolved)
            validateAlert(_alert, _alertId);
        else if (_consensus == AlertStatus.Rejected)
            rejectAlert(_alert, _alertId);
    }
    function removeAlertFromArrays(uint256 _alertId, uint256 _contractId ) internal{
        // removing for unResolvedAlerts
        uint256 len = unResolvedAlerts.length;
        for (uint256 i = 0; i < len; i++) {
            if (unResolvedAlerts[i] == _alertId) {
                unResolvedAlerts[i] = unResolvedAlerts[len - 1];
                unResolvedAlerts.pop();
                break;
            }
        }
        // removing for unResolvedAlerts of contract and adding to resolved
        Contract storage _contract = contractMapping[_contractId];
        _contract.resolvedAlerts.push(_alertId);
        len = _contract.alerts.length;
        for (uint256 i = 0; i < len; i++) {
            if (_contract.alerts[i] == _alertId) {
                _contract.alerts[i] = _contract.alerts[len - 1];
                _contract.alerts.pop();
                break;
            }
        }
    }
    function checkConsensusReached(
        Alert storage _alert
    ) internal view returns (AlertStatus) {
        uint256 _rankThreshold = _alert.isHighPriority
            ? highPriorityRankThreshold
            : rankThreshold;
        uint256 _stakeThreshold = _alert.isHighPriority
            ? highPriorityStakeThreshold
            : stakeThreshold;
        if (
            (_alert.totalNegetiveStake + _alert.totalPositiveStake) >=
            _stakeThreshold &&
            (_alert.totalPositiveRank + _alert.totalNegetiveRank) >=
            _rankThreshold
        ) {
            uint256 stakeRatio = (_alert.totalPositiveStake * 600) /
                (_alert.totalPositiveStake + _alert.totalNegetiveStake);
            uint256 rankRatio = (_alert.totalPositiveRank * 400) /
                (_alert.totalPositiveRank + _alert.totalNegetiveRank);
            uint256 votingPoints = (stakeRatio + rankRatio) / 10;
            if (votingPoints > 66) return AlertStatus.ValidatedUnResolved;
            else if (votingPoints <= 33) return AlertStatus.Rejected;
        }
        return AlertStatus.Pending;
    }

    function calculateRewardAndRank(
        address _validator,
        uint256 _alertId
    ) public view returns (uint256, int256) {
        Alert storage _alert = alertMapping[_alertId];
        Vote storage _vote = _alert.voteMap[_validator];
        // If not voted or pending
        if (_alert.status == AlertStatus.Pending || _vote.stake == 0)
            return (0, 0);
        bool won = (_vote.support == true &&
            (_alert.status == AlertStatus.ValidatedUnResolved ||
                _alert.status == AlertStatus.ValidatedResolved)) ||
            (_vote.support == false && _alert.status == AlertStatus.Rejected);

        uint256 _amount = _vote.stake;
        int256 _rankSum = 0;

        if (won) {
            _rankSum++;
            if (_vote.support == true) {
                _amount +=
                    (_alert.reward * _vote.stake * 4) /
                    (_alert.totalPositiveStake * 5); //4/5*voteStake/totalPositiveStake of total reward goes to voters
                if (_validator == _alert.creatorAddress) {
                    _amount += _alert.reward / 5; //20% for the creator
                    _rankSum += _alert.isHighPriority ? int256(10) : int256(7);
                }
            } else {
                _amount +=
                    (_alert.totalNegetiveRank * _vote.stake * 4) /
                    (_alert.totalPositiveStake * 5); //4/5th of negetive stakes
            }
        } else {
            _rankSum--;
            _amount = _amount / 5;
            if (_validator == _alert.creatorAddress) {
                _rankSum += _alert.isHighPriority ? -7 : -5;
            }
        }
        return (_amount, _rankSum);
    }

    function calculateAllRewardAndRank(
        address _validator
    ) public view returns (uint256, int256) {
        uint256 totalReward = 0;
        int256 totalRank = 0;
        uint256[] storage unclaimedList = validatorMapping[_validator]
            .uncliamedAlertList;

        for (uint256 i = 0; i < unclaimedList.length; i++) {
            uint256 alertId = unclaimedList[i];
            (uint256 _amount, int256 _rank) = calculateRewardAndRank(
                _validator,
                alertId
            );
            totalReward += _amount;
            totalRank += _rank;
        }
        return (totalReward, totalRank);
    }

    function claimReward() external {
        (uint256 _totalReward, int256 totalRank) = calculateAllRewardAndRank(
            msg.sender
        );
        Validator storage _validator = validatorMapping[msg.sender];
        int256 rankSum = int256(_validator.rank) + totalRank;
        if (totalRank < 0) rankSum = 0;
        _validator.rank += uint256(rankSum);
        clearClaimList(validatorMapping[msg.sender].uncliamedAlertList);
        _validator.totalClaimedReward += _totalReward;
        payable(msg.sender).transfer(_totalReward);
    }

    function clearClaimList(uint256[] storage uncliamedAlertList) internal {
        for (uint256 i = 0; i < uncliamedAlertList.length; i++) {
            Alert storage _alert = alertMapping[uncliamedAlertList[i]];
            if (
                _alert.status == AlertStatus.ValidatedUnResolved ||
                _alert.status == AlertStatus.ValidatedResolved
            ) {
                uncliamedAlertList[i] = uncliamedAlertList[
                    uncliamedAlertList.length - 1
                ];
                uncliamedAlertList.pop();
            }
        }
    }

    function withdrawbalance(uint256 _contractId) external {
        Contract storage _contract = contractMapping[_contractId];
        require(_contract.contractOwner == msg.sender, "You're not the owner");
        payable(msg.sender).transfer(_contract.balance);
    }

    function validateAlert(Alert storage _alert, uint256 _alertId) internal {
        removeAlertFromArrays(_alertId, _alert.contractId);
        _alert.status = AlertStatus.ValidatedUnResolved;
        emit AlertResolved(_alertId,_alert.contractId, _alert.status);
    }

    function rejectAlert(Alert storage _alert, uint256 _alertId) internal {
        removeAlertFromArrays(_alertId, _alert.contractId);
        _alert.status = AlertStatus.Rejected;
        emit AlertResolved(_alertId,_alert.contractId, _alert.status);
    }

    function declareAlertResult(uint256 _alertId, bool _accept) external {
        Alert storage _alert = alertMapping[_alertId];
        Contract storage _contract = contractMapping[_alert.contractId];
        require(
            _contract.contractOwner == msg.sender,
            "function is reserved for the owner only"
        );
        require(
            block.timestamp - _alert.creationTime >= 1 days,
            "this function can only be operated after 1 day"
        );
        if (_accept) validateAlert(_alert, _alertId);
        else rejectAlert(_alert,_alertId);
    }

    function puaseContract(uint256 _contractId) external {
        Contract storage _contract = contractMapping[_contractId];
        require(
            _contract.contractOwner == msg.sender,
            "function is reserved for the owner only"
        );
        _contract.status = ContractStatus.Paused;
    }

    function resolveAlert(
        uint256 _alertId,
        string memory _uri
    ) external {
        Alert storage _alert = alertMapping[_alertId];
        Contract storage _contract = contractMapping[_alert.contractId];
        require(
            _contract.contractOwner == msg.sender,
            "function is reserved for the owner only"
        );
        require(
            _alert.status == AlertStatus.ValidatedUnResolved,
            "Not in validated/unresolved"
        );
        resolvedURI[_alertId] = _uri;
        uint256 len = _contract.alerts.length;
        for (uint256 i = 0; i < len; i++) {
            if (_contract.alerts[i] == _alertId) {
                _contract.alerts[i] = _contract.alerts[len - 1];
                _contract.alerts.pop();
                break;
            }
        }
        _contract.resolvedAlerts.push(_alertId);
        _alert.status == AlertStatus.ValidatedResolved;
    }

    function increaseContractBalance(uint256 _contractId) external payable {
        contractMapping[_contractId].balance += msg.value;
    }

    function checkSeverity(
        uint256 _contractId
    ) public view override returns (uint256) {
        Contract storage _contract = contractMapping[_contractId];
        if (_contract.status == ContractStatus.Paused) return 0;
        if(_contract.aiPause) return MAX_SEVERITY;
        uint256[] storage alertIds = _contract.alerts;
        uint256 sevierity;
        for (uint256 i = 0; i < alertIds.length; i++) {
            Alert storage _alert = alertMapping[alertIds[i]];
            if(_alert.status==AlertStatus.ValidatedUnResolved){
                if (_alert.isHighPriority) return MAX_SEVERITY;
                else sevierity++;
            }
            if (sevierity >= MAX_SEVERITY) return MAX_SEVERITY;
        }
        return sevierity;
    }

    function isCritical(
        uint256 contractId
    ) external view override returns (bool) {
        if (checkSeverity(contractId) >= MAX_SEVERITY) return true;
        return false;
    }

    //test functions
    // Add this function to your DERS_V2 contract
    function getVote(
        uint256 _alertId,
        address _voter
    )
        public
        view
        returns (uint256 stake, bool support, uint256 rank, uint256 time)
    {
        Alert storage alert = alertMapping[_alertId];
        Vote storage _vote = alert.voteMap[_voter];
        return (_vote.stake, _vote.support, _vote.rank, _vote.time);
    }

    function getContracts() external view returns (RContract[] memory) {
        RContract[] memory array = new RContract[](contractCount);
        for (uint256 i = 0; i < contractCount; i++) {
            Contract storage _contract = contractMapping[i];
            array[i] = RContract(
                i,
                _contract.status,
                _contract.contractAddress,
                _contract.balance,
                _contract.reward,
                _contract.severity,
                _contract.minStake,
                _contract.minRank,
                _contract.alerts,
                _contract.resolvedAlerts,
                _contract.aiPause
            );
        }
        return array;
    }

    function getAlertDetails(
        uint256 id,
        address _user
    ) external view returns (RAlert memory) {
        Alert storage _alert = alertMapping[id];
        RAlert memory res = RAlert(
            id,
            _alert.contractId,
            _alert.creationTime,
            _alert.status,
            _alert.reward,
            _alert.stake,
            _alert.isHighPriority,
            _alert.validatorsList.length,
            _alert.voteMap[_user].stake != 0,
            alertURI[id]
        );
        return res;
    }

    function getAlertsBulk(
        uint256[] memory alerts,
        address _user
    ) public view returns (RAlert[] memory) {
        uint256 len = alerts.length;
        RAlert[] memory array = new RAlert[](len);
        for (uint256 i = 0; i < len; i++) {
            Alert storage _alert = alertMapping[alerts[i]];
            array[i] = RAlert(
                alerts[i],
                _alert.contractId,
                _alert.creationTime,
                _alert.status,
                _alert.reward,
                _alert.stake,
                _alert.isHighPriority,
                _alert.validatorsList.length,
                _alert.voteMap[_user].stake != 0,
                alertURI[i]
            );
        }
        return array;
    }

    function getUnresolvedAlerts(
        address _user
    ) external view returns (RAlert[] memory) {
        return getAlertsBulk(unResolvedAlerts, _user);
    }

    function getUserUnClaimedList(
        address _user
    ) external view returns (RAlert[] memory) {
        return getAlertsBulk(validatorMapping[_user].uncliamedAlertList, _user);
    }

    function getUserContracts(
        address _validator
    ) external view returns (RContract[] memory) {
        uint256[] storage contracts = validatorMapping[_validator].contracts;
        RContract[] memory array = new RContract[](contracts.length);
        for (uint256 i = 0; i < contracts.length; i++) {
            Contract storage _contract = contractMapping[contracts[i]];
            array[i] = RContract(
                i,
                _contract.status,
                _contract.contractAddress,
                _contract.balance,
                _contract.reward,
                _contract.severity,
                _contract.minStake,
                _contract.minRank,
                _contract.alerts,
                _contract.resolvedAlerts,
                _contract.aiPause
            );
        }
        return array;
    }
    function changeThreshold(uint256 _rankThreshold,uint256 _highPriorityRankThreshold,uint256 _stakeThreshold,uint256 _highPrioritySakeThreshold)external {
        require(msg.sender==owner,"resevred for owner only");
        rankThreshold=_rankThreshold;
        highPriorityRankThreshold=_highPriorityRankThreshold;
        stakeThreshold=_stakeThreshold;
        highPriorityStakeThreshold=_highPrioritySakeThreshold;
    }
    function ImplementAiPause(uint256 _contractId) external{
        require(msg.sender==owner,"reserved for owner only");
        contractMapping[_contractId].aiPause=true;
    }
    function resolvedAiPuase(uint256 _contractId) external{
        require(msg.sender==contractMapping[_contractId].contractOwner,"reserved for contract owner only");
        contractMapping[_contractId].aiPause=false;
    }
}
