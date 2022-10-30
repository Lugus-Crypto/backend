import {task} from "hardhat/config";

//npx hardhat deploy --network localhost
task("deploy", "Deploys contracts")
  .setAction(async (taskArgs, {ethers, run}) => {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const MockStaking = await ethers.getContractFactory("MockStaking");
  const LugusSwapper = await ethers.getContractFactory("LugusSwapper");
  const SimpleERC20 = await ethers.getContractFactory("SimpleERC20");

  const mockStaking = await MockStaking.deploy();
  const lugusSwapper = await LugusSwapper.deploy();
  const tokenA = await SimpleERC20.deploy();
  const tokenB = await SimpleERC20.deploy();
  const tokenC = await SimpleERC20.deploy();

  await mockStaking.deployed();
  await lugusSwapper.deployed();
  await tokenA.deployed();
  await tokenB.deployed();
  await tokenC.deployed();

  await tokenA.transfer("0x781E84832cf17ACfdfAD9Beb0C408f76aEd54DF4", ethers.utils.parseEther('1000'));
  await tokenB.transfer("0x781E84832cf17ACfdfAD9Beb0C408f76aEd54DF4", ethers.utils.parseEther('1000'));
  await tokenC.transfer("0x781E84832cf17ACfdfAD9Beb0C408f76aEd54DF4", ethers.utils.parseEther('1000'));

    const user = '0x781E84832cf17ACfdfAD9Beb0C408f76aEd54DF4';
  await mockStaking.addTokenToList(tokenA.address);
  await mockStaking.addTokenToList(tokenB.address);
  await mockStaking.addTokenToList(tokenC.address);

  console.log(`MockStaking=${mockStaking.address}`);
  console.log(`LugusSwapper=${lugusSwapper.address}`);
  console.log(`TokenA=${tokenA.address}`);
  console.log(`TokenB=${tokenB.address}`);
  console.log(`TokenC=${tokenC.address}`);

    console.log(`Balance TokenA=${await tokenA.balanceOf(user)}`);
    console.log(`Balance TokenB=${await tokenB.balanceOf(user)}`);
    console.log(`Balance TokenC=${await tokenC.balanceOf(user)}`);
});


task("deploySushiswaphelper", "Deploys contracts")
  .setAction(async (taskArgs, {ethers, run}) => {
    const SushiSwapHelper = await ethers.getContractFactory("SushiSwapHelper");
    const sushiSwapHelper = await SushiSwapHelper.deploy();
    await sushiSwapHelper.deployed();

    console.log(`SushiSwapHelper=${sushiSwapHelper.address}`);
  });


task("deployLugusAuto", "Deploys more contracts")
  .setAction(async (taskArgs, {ethers, run}) => {
  const LugusAutomaticSwapper = await ethers.getContractFactory("LugusAutomaticSwapper");
  const SimpleERC20 = await ethers.getContractFactory("SimpleERC20");

  const tokenD = await SimpleERC20.deploy();
  const lugusAutomaticSwapper = await LugusAutomaticSwapper.deploy(60);

  await lugusAutomaticSwapper.deployed();
  await tokenD.deployed();

  await tokenD.transfer(lugusAutomaticSwapper.address, 1000);
  await tokenD.transfer("0x32F9e7f06d614903bD4FC0d6618E8008559b409C", 1000);

  await lugusAutomaticSwapper.setToken(tokenD.address);

  console.log(`LugusAutomaticSwapper=${lugusAutomaticSwapper.address}`);
  console.log(`TokenD=${tokenD.address}`);
});
