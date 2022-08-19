import { Contract, providers } from 'ethers'
import { ethers, network } from 'hardhat'

export async function setupUsers<
  T extends { [contractName: string]: Contract }
>(addresses: string[], contracts: T): Promise<({ address: string } & T)[]> {
  const users: ({ address: string } & T)[] = []
  for (const address of addresses) {
    users.push(await setupUser(address, contracts))
  }
  return users
}

export async function setupUser<T extends { [contractName: string]: Contract }>(
  address: string,
  contracts: T
): Promise<{ address: string } & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { address }
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address))
  }
  return user as { address: string } & T
}

export async function advanceTime(time: number): Promise<void> {
  await network.provider.send('evm_increaseTime', [time])
}
export async function advanceBlock(): Promise<void> {
  await network.provider.send('evm_mine', [])
}
export async function advanceTimeAndBlock(
  time: number
): Promise<providers.Block> {
  await advanceTime(time)
  await advanceBlock()
  return Promise.resolve(ethers.provider.getBlock('latest'))
}
