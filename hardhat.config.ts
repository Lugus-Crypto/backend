import {HardhatUserConfig} from "hardhat/config";
import {NetworkUserConfig} from "hardhat/types";
require("dotenv").config({ path: ".env"});
import "./scripts/deploy";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.8.6",
      }
    ]
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
        // url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      },
      accounts: {
        accountsBalance: '10000000000000000000000',
      },
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [POLYGON_PRIVATE_KEY]
    }
  }
};