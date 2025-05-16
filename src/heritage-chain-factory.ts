import { BigInt } from "@graphprotocol/graph-ts";
import { HeritageChainCreated as HeritageChainCreatedEvent } from "../generated/HeritageChainFactory/HeritageChainFactory"
import { HeritageChainContract } from "../generated/schema"
import { HeritageChain } from "../generated/templates"

export function handleHeritageChainCreated(
  event: HeritageChainCreatedEvent
): void {
  let entity = new HeritageChainContract(event.params.contractAddress.toHexString())

  entity.creator = event.params.creator
  entity.createdAtTimestamp = event.params.timestamp
  entity.triggerType = "NONE" // Initialize triggerType
  entity.triggerTimestamp = BigInt.fromI32(0) // Initialize triggerTimestamp
  entity.isTriggerActivated = false // Initialize isTriggerActivated
  entity.isDistributed = false // Initialize isDistributed

  // TheGraph CLI will generate this based on the template in subgraph.yaml
  HeritageChain.create(event.params.contractAddress)

  entity.save()
}
