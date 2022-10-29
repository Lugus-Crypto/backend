#Contracts deployed to Mumbai
MockStaking=0x2d6A20e20911a27d0b4952f88e1dc80f43f18562
LugusSwapper=0x2cef87A124095d476A6F44d5ebF0d8E2F0c5b4D6
TokenA=0x9F78D0E58557cDF453b38E86Ce876e5c74C92895
TokenB=0xF6929C08f88Ba41fFBCB516a694237aa0333F1DA
TokenC=0xbd48849963095E162A1b5548672c494467876651

#Testing the contracts
//Approve for staking stakeAmount into mockStaking. 
tokenA.connect(alice).approve(mockStaking.address, stakeAmount)

//Stake stakeAmount
mockStaking.connect(alice).stake(tokenA.address, stakeAmount)

//Allow to claim tokens
mockStaking.connect(alice).allowClaim(lugusSwapper.address)

//Claim all staked tokens
lugusSwapper.connect(alice).claimAllAndSwapForEth(mockStaking.address)