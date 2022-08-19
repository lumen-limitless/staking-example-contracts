import 'dotenv/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import { task } from 'hardhat/config'
import { node_url, accounts, addForkConfiguration } from './utils/network'
import { HardhatUserConfig } from 'hardhat/types'

task(
  'blockNumber',
  'Prints the current block number',
  async (_, { ethers }) => {
    await ethers.provider.getBlockNumber().then((blockNumber) => {
      console.log('Current block number: ' + blockNumber)
    })
  }
)

task('balance', 'Prints an account balance')
  .addParam('account', 'the account address')
  .setAction(async (args, { ethers }) => {
    const account = ethers.utils.getAddress(args.account)
    const balance = await ethers.provider.getBalance(account)

    console.log(ethers.utils.formatEther(balance), 'ETH')
  })

task('keygen', 'Prints a new private key', async (_, { ethers }) => {
  const wallet = ethers.Wallet.createRandom()
  console.log(`Public address: ${wallet.address}`)
  console.log(`Private key: ${wallet.privateKey}`)
})

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },

  networks: addForkConfiguration({
    hardhat: {
      initialBaseFeePerGas: 0, // to fix : https://github.com/sc-forks/solidity-coverage/issues/652, see https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
    },
    localhost: {
      url: node_url('localhost'),
      accounts: accounts(),
    },
    mainnet: {
      url: node_url('mainnet'),
      accounts: accounts('mainnet'),
    },
    arbitrum: {
      url: node_url('arbitrum'),
      accounts: accounts('arbitrum'),
    },
    optimism: {
      url: node_url('optimism'),
      accounts: accounts('optimism'),
    },
    goerli: {
      url: node_url('goerli'),
      accounts: accounts('goerli'),
    },
    polygon: {
      url: node_url('polygon'),
      accounts: accounts('polygon'),
    },
    bsc: {
      url: node_url('bsc'),
      accounts: accounts('bsc'),
    },
    avalanche: {
      url: node_url('avalanche'),
      accounts: accounts('avalanche'),
    },
  }),

  paths: {
    sources: 'src',
  },

  gasReporter: {
    currency: 'USD',
    gasPrice: 30,
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    maxMethodDiff: 10,
  },

  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },

  etherscan: {
    apiKey: {
      mainnet: process.env.SCAN_API_KEY_MAINNET || '',
      goerli: process.env.SCAN_API_KEY_GOERLI || '',
      optimisticEthereum: process.env.SCAN_API_KEY_OPTIMISM || '',
      arbitrumOne: process.env.SCAN_API_KEY_ARBITRUM || '',
      polygon: process.env.SCAN_API_KEY_POLYGON || '',
      bsc: process.env.SCAN_API_KEY_BSC || '',
      avalanche: process.env.SCAN_API_KEY_AVALANCHE || '',
    },
  },

  external: process.env.HARDHAT_FORK
    ? {
        deployments: {
          // process.env.HARDHAT_FORK will specify the network that the fork is made from.
          // these lines allow it to fetch the deployments from the network being forked from both for node and deploy task
          hardhat: ['deployments/' + process.env.HARDHAT_FORK],
          localhost: ['deployments/' + process.env.HARDHAT_FORK],
        },
      }
    : undefined,
}

export default config
