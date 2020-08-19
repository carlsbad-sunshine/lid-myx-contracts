pragma solidity 0.5.16;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "./library/BasisPoints.sol";
import "./myx.sol";


contract MyxDaoFund is Initializable, Ownable {
    using BasisPoints for uint;
    using SafeMath for uint;

    uint public releaseInterval;
    uint public releaseStart;
    uint public releaseBP;

    uint public startingTokens;
    uint public claimedTokens;

    IERC20 private token;

    address releaseWallet;

    bool hasMovedToPresale;
    bool hasMovedToPresale2;

    modifier onlyAfterStart {
        require(releaseStart != 0 && now > releaseStart, "Has not yet started.");
        _;
    }

    function initialize(
        uint _releaseInterval,
        uint _releaseBP,
        address owner,
        IERC20 _token
    ) external initializer {
        releaseInterval = _releaseInterval;
        releaseBP = _releaseBP;
        token = _token;

        Ownable.initialize(msg.sender);

        //Due to issue in oz testing suite, the msg.sender might not be owner
        _transferOwnership(owner);
    }

    function freeze() external onlyOwner {
        require(token.balanceOf(address(this)) > 0, "Must have tokens to stake.");
        MYXNetwork myxContract = MYXNetwork(address(token));
        myxContract.freeze(token.balanceOf(address(this)));
    }

    function unfreeze(uint amount) external onlyOwner onlyAfterStart {
        require(releaseStart != 0, "Has not yet started.");
        MYXNetwork myxContract = MYXNetwork(address(token));
        uint cycle = getCurrentCycleCount();
        uint maxClaim = cycle.mul(startingTokens.mulBP(releaseBP));
        uint totalClaimAmount = cycle.mul(startingTokens.mulBP(releaseBP));
        uint toClaim = totalClaimAmount.sub(maxClaim);
        if (myxContract.frozenOf(address(this)) < toClaim) toClaim = myxContract.frozenOf(address(this));
        require(amount <= toClaim, "Cannot unstake more than available to claim.");
        claimedTokens = claimedTokens.add(amount);
        myxContract.unfreeze(amount);
    }

    function collect() external onlyAfterStart {
        MYXNetwork myxContract = MYXNetwork(address(token));
        myxContract.collect();
    }

    function claim() external onlyAfterStart {
        token.transfer(releaseWallet, token.balanceOf(address(this)));
    }

    function startRelease(address _releaseWallet) external onlyOwner {
        require(startingTokens == 0);
        releaseWallet = _releaseWallet;
        startingTokens = 50000000 ether;
        releaseStart = now.sub(24 hours);
        releaseInterval = 180 days;
        releaseBP = 1000;
    }

    function getCurrentCycleCount() public view returns (uint) {
        if (now <= releaseStart) return 0;
        return now.sub(releaseStart).div(releaseInterval);
    }

}
