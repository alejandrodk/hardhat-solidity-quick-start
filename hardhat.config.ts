import dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY as string;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY as string;

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },
};

// run this task with: npx hardhat accounts
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  // You are free to do anything you want in this function.
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

export default config;
