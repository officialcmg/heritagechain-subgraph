import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { HeritageChainCreated } from "../generated/HeritageChainFactory/HeritageChainFactory"

export function createHeritageChainCreatedEvent(
  creator: Address,
  contractAddress: Address,
  timestamp: BigInt
): HeritageChainCreated {
  let heritageChainCreatedEvent =
    changetype<HeritageChainCreated>(newMockEvent())

  heritageChainCreatedEvent.parameters = new Array()

  heritageChainCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  heritageChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  heritageChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return heritageChainCreatedEvent
}
