//imports
const { ethers, run } = require("hardhat");

const main = async () => {
  const [owner, superCoder] = await hre.ethers.getSigners();

  // Hardhat Runtime Environment => hre

  const domainContractFactory = await hre.ethers.getContractFactory("Domains");

  // We pass in "com" to the constructor when deploying
  const domainContract = await domainContractFactory.deploy("com");
  await domainContract.deployed();

  console.log("Contract owner => ", owner.address);
  console.log("Contract deployed to ", domainContract.address);

  // The price of the domain in Matic
  let txn = await domainContract.register("hancom", {
    value: hre.ethers.utils.parseEther("100"),
  });
  await txn.wait();

  // How much money is in the contract?
  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log(" Contract balance: ", hre.ethers.utils.formatEther(balance));

  // Not the owner tried to rob the funds from the contract
  try {
    txn = await domainContract.connect(superCoder).withdraw();
    await txn.wait();
  } catch (error) {
    console.log("Could not rob contract");
  }

  // Look in the wallet so we can compare
  let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
  console.log("Balance of owner before withdrawl", hre.ethers.utils.formatEther(ownerBalance));

  // looks like the owner is saving their money
  txn = await domainContract.connect(owner).withdraw();
  await txn.wait();

  // Fetch balance of contract & owner
  const contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
  ownerBalance = await hre.ethers.provider.getBalance(owner.address);

  console.log("Check Contract balance after withdrawl", hre.ethers.utils.formatEther(contractBalance));
  console.log("Check Owner balance after withdrawl", hre.ethers.utils.formatEther(ownerBalance));

  console.log(network.config);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
