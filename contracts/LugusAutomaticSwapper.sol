pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

import {IERC20} from "@uniswap/v2-core/contracts/interfaces/IERC20.sol";
import {MockStaking} from "./MockStaking.sol";


contract LugusAutomaticSwapper is AutomationCompatibleInterface {

	/**
    * Public counter variable
    */
    uint public counter;

    address[] public accounts;
    uint256[] public intervals;

    address lugusSwapper = 0x2cef87A124095d476A6F44d5ebF0d8E2F0c5b4D6;
    address mockStakingAddress = 0x2d6A20e20911a27d0b4952f88e1dc80f43f18562;

    MockStaking mockStaking = MockStaking(mockStakingAddress);
    IERC20 token = IERC20(tokenAddress);

    /**
    * Use an interval in seconds and a timestamp to slow execution of Upkeep
    */
    uint public immutable interval;
    uint public lastTimeStamp;

    constructor(uint updateInterval) {
      interval = updateInterval;
      lastTimeStamp = block.timestamp;
      counter = 0;
    }

    function setToken(address token) external {
    	tokenAddress = token;
    }

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        bool upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
        return (upkeepNeeded);
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        if ((block.timestamp - lastTimeStamp) > interval ) {
            lastTimeStamp = block.timestamp;
            counter = counter + 1;
 			// lugusSwapper.claimAllAndSwapForEth(mockStakingAddress, );
        }        
    }
}