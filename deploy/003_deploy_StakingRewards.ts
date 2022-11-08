import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const steak = await ethers.getContract('SteakToken')

  const cookedSteak = await ethers.getContract('CookedSteakToken')
  await deploy('StakingRewards', {
    from: deployer,
    args: [steak.address, cookedSteak.address, 'Staked SteakToken', 'sSteak'],
    skipIfAlreadyDeployed: true,
    proxy: false,
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  })
}

export default func
func.tags = ['Staking']
