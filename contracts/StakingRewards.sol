// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "./SteakToken.sol";
import "./CookedSteakToken.sol";

contract StakingRewards is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC20Permit;

    /* ========== STATE VARIABLES ========== */
    address public immutable stakingToken;
    address public rewardToken;

    string public name;
    string public symbol;

    uint public rewardRate;
    uint public lastUpdateTime;
    uint public rewardPerTokenStored;
    uint public totalSupply;

    bool public paused;

    mapping(address => uint) public userRewardPerTokenPaid;
    mapping(address => uint) public rewards;
    mapping(address => uint) private _balances;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _stakingToken,
        address _rewardToken,
        string memory _name,
        string memory _symbol
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        name = _name;
        symbol = _symbol;
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();

        if (account != address(0)) {
            //update rewards for account
            rewards[account] = earned(account);
            //update userRewardPerTokenPaid for account
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }

        _;
    }

    /* ========== VIEWS ========== */

    function balanceOf(address account) external view returns (uint) {
        return _balances[account];
    }

    function earned(address account) public view returns (uint) {
        return
            ((_balances[account] *
                (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    function getRewardForDuration(uint duration) external view returns (uint) {
        return rewardRate * duration;
    }

    function lastTimeRewardApplicable() public view returns (uint) {
        return block.timestamp;
    }

    function rewardPerToken() public view returns (uint) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((lastTimeRewardApplicable() - lastUpdateTime) *
                rewardRate *
                1e18) / totalSupply);
    }

    /* ========== FUNCTIONS ========== */

    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }

    function getReward() public nonReentrant updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            CookedSteakToken(rewardToken).mint(reward, msg.sender);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function stake(uint amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        require(!paused, "Staking is currently disabled");
        totalSupply += amount;
        _balances[msg.sender] += amount;
        IERC20(stakingToken).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        emit Staked(msg.sender, amount);
    }

    function stakeWithPermit(
        uint amount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        require(!paused, "Staking is currently disabled");

        totalSupply += amount;
        _balances[msg.sender] += amount;
        IERC20Permit(stakingToken).safePermit(
            msg.sender,
            address(this),
            type(uint).max,
            type(uint).max,
            v,
            r,
            s
        );
        IERC20(stakingToken).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint amount)
        public
        nonReentrant
        updateReward(msg.sender)
    {
        require(amount > 0, "Cannot withdraw 0");
        totalSupply -= amount;
        _balances[msg.sender] -= amount;
        IERC20(stakingToken).safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setPaused(bool state) external onlyOwner {
        paused = state;
    }

    // recover wrong tokens
    function recoverERC20(address tokenAddress, uint tokenAmount)
        external
        onlyOwner
    {
        require(
            tokenAddress != address(stakingToken) &&
                tokenAddress != address(rewardToken),
            "Cannot withdraw staking/reward token"
        );
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    function setRewardRate(uint rate)
        external
        onlyOwner
        updateReward(address(0))
    {
        rewardRate = rate;
        emit RewardRateSet(rewardRate);
    }

    /* ========== EVENTS ========== */

    event RewardRateSet(uint rewardRate);
    event Staked(address indexed user, uint amount);
    event Withdrawn(address indexed user, uint amount);
    event RewardPaid(address indexed user, uint reward);
    event RewardsDurationUpdated(uint newDuration);
    event Recovered(address token, uint amount);
}
