const main = async () => {
  // Hardhat Runtime Environment => hre

  const domainContractFactory = await hre.ethers.getContractFactory("Domains");

  // We pass in "com" to the constructor when deploying
  const domainContract = await domainContractFactory.deploy("strangers");
  await domainContract.deployed();

  console.log("Contract deployed to ", domainContract.address);

  // The price of the domain in Matic
  const txn = await domainContract.register("netflix", {
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await txn.wait();

  const address = await domainContract.getAddress("netflix");
  console.log("Owner of domain netflix: ", address);

  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
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
