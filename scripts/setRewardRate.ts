import hre from 'hardhat'
import { StakingRewards } from '../typechain'

const main = async () => {
  const rewardRate = process.argv[2]
  if (!rewardRate) throw new Error('Please specify a reward rate')
  const staking: StakingRewards = await hre.ethers.getContract('StakingRewards')
  await staking.setRewardRate(rewardRate)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
