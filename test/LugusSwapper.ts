import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { BigNumber, Contract, ContractFactory } from "ethers";

describe("LugusSwapper", function () {
	let deployer: SignerWithAddress,
		alice: SignerWithAddress,
		bob: SignerWithAddress,
		carol: SignerWithAddress,
		dave: SignerWithAddress,
		LugusSwapper: ContractFactory,
		MockStaking: ContractFactory,
		SimpleERC20: ContractFactory,
		SushiSwapHelper: ContractFactory,
		// LugusAutomaticSwapper: ContractFactory,
		lugusSwapper: Contract,
		mockStaking: Contract,
		tokenA: Contract,
		tokenB: Contract,
		tokenC: Contract,
		sushiSwapHelper: Contract;
		// lugusAutomaticSwapper: Contract;

	const SETUP_AMOUNT = 1000,
		STAKE_AMOUNT = 100;

	before(async function () {
		//Deploy LugusSwapper
		LugusSwapper = await ethers.getContractFactory("LugusSwapper");
		lugusSwapper = await LugusSwapper.deploy();

		//Deploy MockStacking
		MockStaking = await ethers.getContractFactory("MockStaking");
		mockStaking = await MockStaking.deploy();

		//Deploy SimpleERC20
		SimpleERC20 = await ethers.getContractFactory("SimpleERC20");
		tokenA = await SimpleERC20.deploy();
		tokenB = await SimpleERC20.deploy();
		tokenC = await SimpleERC20.deploy();

		//Deploy SushiSwapHelper
		SushiSwapHelper = await ethers.getContractFactory("SushiSwapHelper");
		sushiSwapHelper = await SushiSwapHelper.deploy();

		//Deploy LugusAutomaticSwapper
		// LugusAutomaticSwapper = await ethers.getContractFactory("LugusAutomaticSwapper");
		// lugusAutomaticSwapper = await LugusAutomaticSwapper.deploy(30);

		//Initiate signers
		[deployer, alice] = await ethers.getSigners();
	});

	describe("Initialize MockStaking", function () {
		it("Set LugusSwapper as swapper address", async function() {
			await mockStaking.setSwapperAddress(lugusSwapper.address);
		});

		it("Add tokens to MockStaking", async function () {
			await mockStaking.addTokenToList(tokenA.address);
			await mockStaking.addTokenToList(tokenB.address);
			await mockStaking.addTokenToList(tokenC.address);	
		});

		it("Transfers " + SETUP_AMOUNT + " tokens to alice", async function() {
			await expect(await tokenA.transfer(alice.address, SETUP_AMOUNT)).to.changeTokenBalances(tokenA, [deployer, alice], [-SETUP_AMOUNT, SETUP_AMOUNT]);
			await expect(await tokenB.transfer(alice.address, SETUP_AMOUNT)).to.changeTokenBalances(tokenB, [deployer, alice], [-SETUP_AMOUNT, SETUP_AMOUNT]);
			await expect(await tokenC.transfer(alice.address, SETUP_AMOUNT)).to.changeTokenBalances(tokenC, [deployer, alice], [-SETUP_AMOUNT, SETUP_AMOUNT]);
		});
		
		it("Stake " + STAKE_AMOUNT + " tokens", async function () {
			await tokenA.connect(alice).approve(mockStaking.address, STAKE_AMOUNT);
			await tokenB.connect(alice).approve(mockStaking.address, STAKE_AMOUNT);
			await tokenC.connect(alice).approve(mockStaking.address, STAKE_AMOUNT);
			await expect(await mockStaking.connect(alice).stake(tokenA.address, STAKE_AMOUNT), "Staking tokenA").to.changeTokenBalances(tokenA, [mockStaking, alice], [STAKE_AMOUNT, -STAKE_AMOUNT]);
			await expect(await mockStaking.connect(alice).stake(tokenB.address, STAKE_AMOUNT), "Staking tokenB").to.changeTokenBalances(tokenB, [mockStaking, alice], [STAKE_AMOUNT, -STAKE_AMOUNT]);
			await expect(await mockStaking.connect(alice).stake(tokenC.address, STAKE_AMOUNT), "Staking tokenC").to.changeTokenBalances(tokenC, [mockStaking, alice], [STAKE_AMOUNT, -STAKE_AMOUNT]);
		});
	});

	describe("Claim tokens", function () {
		it("Claim " + STAKE_AMOUNT + " tokens from user", async function () {
			// await mockStaking.connect(alice).allowClaim(deployer.address);
			await expect(await mockStaking.connect(alice).claim(alice.address, tokenA.address), "Claim tokenA").to.changeTokenBalances(tokenA, [mockStaking, alice], [-STAKE_AMOUNT, STAKE_AMOUNT]);
			await expect(await mockStaking.connect(alice).claimAll(alice.address), "Claim all tokens")
				.to.changeTokenBalances(tokenA, [mockStaking, lugusSwapper], [0, 0])
				.to.changeTokenBalances(tokenB, [mockStaking, lugusSwapper], [-STAKE_AMOUNT, STAKE_AMOUNT])
				.to.changeTokenBalances(tokenC, [mockStaking, lugusSwapper], [-STAKE_AMOUNT, STAKE_AMOUNT]);
		});

		it("Claim " + STAKE_AMOUNT + " tokens from approved address", async function () {
			await stakeTokensUtils(STAKE_AMOUNT);
			await mockStaking.connect(alice).allowClaim(deployer.address);
			await expect(await mockStaking.connect(deployer).claim(alice.address, tokenA.address), "Claim tokenA").to.changeTokenBalances(tokenA, [mockStaking, alice], [-STAKE_AMOUNT, STAKE_AMOUNT]);
			await expect(await mockStaking.connect(deployer).claimAll(alice.address), "Claim all tokens")
				.to.changeTokenBalances(tokenA, [mockStaking, lugusSwapper], [0, 0])
				.to.changeTokenBalances(tokenB, [mockStaking, lugusSwapper], [-STAKE_AMOUNT, STAKE_AMOUNT])
				.to.changeTokenBalances(tokenC, [mockStaking, lugusSwapper], [-STAKE_AMOUNT, STAKE_AMOUNT]);
		});

		// it("Claim and Swap singel token", async function () {
		// 	expect ( 
		// 		await lugusSwapper.connect(alice).claimAndSwap(mockStaking.address, tokenA.address)
		// 	).to.not.be.reverted;
		// });

		// it("Claim and Swap all", async function () {
		// 	await lugusSwapper.connect(alice).claimAll(mockStaking.address);
		// });
	})


	describe("Claim " + STAKE_AMOUNT + " units from one token", function () {
		it("To USDC", async function () {
			// expect(1).to.be.equal(0);
		});
		it("To ETH", async function () {
			await stakeTokenUtils(ethers.utils.parseEther("1"));
			await tokenA.connect(deployer).transfer(sushiSwapHelper.address, ethers.utils.parseEther("100"));

			const deployerBalance = await tokenA.balanceOf(deployer.address);
			// console.log("the dep ", ethers.utils.parseEther(deployerBalance.toString()));
			// console.log("the dep ", ethers.utils.parseEther("10"));
			await sushiSwapHelper.connect(deployer).addLiquidity(
				tokenA.address,
				ethers.utils.parseEther("10"),
				ethers.utils.parseEther("10"),
				{ value: ethers.utils.parseEther("10") }
			);

			const reserve = await sushiSwapHelper.getReserves();
			console.log("the res ", reserve);

			await tokenA.approve(sushiSwapHelper.address, ethers.utils.parseEther("10"));
			await tokenA.approve('0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', ethers.utils.parseEther("10"));

			await mockStaking.connect(alice).allowClaim(lugusSwapper.address);
			await expect(await lugusSwapper.connect(alice).claimAndSwapForEth(mockStaking.address, tokenA.address), "Claim & swap token A for ETH")
				.to.changeTokenBalances(tokenA, [lugusSwapper, alice], [0, 0]);

		});
	});

	

	describe("Can claim token on a defined schedule", function () {
		it("Now", async function () {
			// expect(1).to.be.equal(0);
		});

		it("Weekly", async function () {
			// expect(1).to.be.equal(0);
		});

		it("Monthly", async function ( ) {
			// expect(1).to.be.equal(0);
		});
	});

	describe("Send tokens to users wallet", function () {
		it("", async function () {
			// expect(1).to.be.equal(0);
		});
	});


	const stakeTokensUtils = async (tokenAmount: number) => {
		await tokenA.connect(alice).approve(mockStaking.address, tokenAmount);
		await tokenB.connect(alice).approve(mockStaking.address, tokenAmount);
		await tokenC.connect(alice).approve(mockStaking.address, tokenAmount);
		await mockStaking.connect(alice).stake(tokenA.address, tokenAmount);
		await mockStaking.connect(alice).stake(tokenB.address, tokenAmount);
		await mockStaking.connect(alice).stake(tokenC.address, tokenAmount);
	}

	const stakeTokenUtils = async (tokenAmount: BigNumber) => {
		await tokenA.transfer(alice.address, tokenAmount)
		await tokenA.connect(alice).approve(mockStaking.address, tokenAmount);
		await mockStaking.connect(alice).stake(tokenA.address, tokenAmount);
	}
});