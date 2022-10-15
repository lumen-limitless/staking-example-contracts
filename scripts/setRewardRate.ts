import hre from 'hardhat'
import { StakingRewards } from '../typechain'

const main = async () => {
  const deployer = (await hre.ethers.getSigners())[0]
  const staking: StakingRewards = await hre.ethers.getContractAt(
    'StakingRewards',
    (
      await hre.deployments.get('StakingRewards')
    ).address,
    deployer
  )

  await staking.setRewardRate(process.argv[2])
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
