import { HeritageChainCreated as HeritageChainCreatedEvent } from "../generated/HeritageChainFactory/HeritageChainFactory"
import { HeritageChainCreated } from "../generated/schema"

export function handleHeritageChainCreated(
  event: HeritageChainCreatedEvent
): void {
  let entity = new HeritageChainCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.contractAddress = event.params.contractAddress
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
