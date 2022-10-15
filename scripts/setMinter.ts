import hre from 'hardhat'
import { CookedSteakToken } from '../typechain'

const main = async () => {
  const deployer = (await hre.ethers.getSigners())[0]
  const token: CookedSteakToken = await hre.ethers.getContractAt(
    'CookedSteakToken',
    (
      await hre.deployments.get('CookedSteakToken')
    ).address,
    deployer
  )

  const stakingAddress = (await hre.deployments.get('StakingRewards')).address
  await token.setMinter(stakingAddress)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
