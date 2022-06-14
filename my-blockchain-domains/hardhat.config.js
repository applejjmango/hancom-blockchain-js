require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: "0.8.9",
  networks: {
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/ubCmPUujwbNcE2T3KZrX-rpUx5Rc5OHH",
      accounts: ["91828388805ba0e1ace33e3aa154143ecf58dfdd8f47d610945a1c9742dc1c1d"],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY, // ETHERSCAN_API_KEY
  },
};
