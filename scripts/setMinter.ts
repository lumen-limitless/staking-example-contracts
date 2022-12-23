import hre from 'hardhat'
import { CookedSteakToken } from '../typechain'

const main = async () => {
  const token: CookedSteakToken = await hre.ethers.getContract(
    'CookedSteakToken'
  )
  const stakingAddress = (await hre.deployments.get('StakingRewards')).address
  const tx = await token.setMinter(stakingAddress)
  await tx.wait()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
