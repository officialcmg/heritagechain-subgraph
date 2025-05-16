import { BigInt } from "@graphprotocol/graph-ts";
import {
  HeritageChain,
  TriggerSet as TriggerSetEvent,
  TriggerActivated as TriggerActivatedEvent,
  DistributionExecuted as DistributionExecutedEvent,
  LegacyPlanCancelled as LegacyPlanCancelledEvent
} from "../generated/templates/HeritageChain/HeritageChain";
import { HeritageChainContract } from "../generated/schema";

function getTriggerTypeString(triggerType: i32): string {
  if (triggerType == 0) return "NONE";
  if (triggerType == 1) return "TIME_BASED";
  if (triggerType == 2) return "VOLUNTARY";
  return "UNKNOWN";
}

export function handleTriggerSet(event: TriggerSetEvent): void {
  let id = event.address.toHexString();
  let entity = HeritageChainContract.load(id);

  if (entity == null) {
    // This should ideally not happen if factory correctly creates entity
    // However, you could create it here as a fallback if necessary,
    // but it would be missing creator and createdAtTimestamp from factory event.
    // For now, we'll assume entity exists.
    return;
  }

  entity.triggerType = getTriggerTypeString(event.params.triggerType);
  // In the contract, TriggerType is an enum: enum TriggerType { NONE, TIME_BASED, VOLUNTARY }
  // We need to map the uin8 to a string for the schema.
  // event.params.triggerType will be 0 for NONE, 1 for TIME_BASED, 2 for VOLUNTARY

  if (entity.triggerType == "TIME_BASED") {
    entity.triggerTimestamp = event.params.timestamp;
  } else {
    entity.triggerTimestamp = BigInt.fromI32(0);
  }

  entity.save();
}

export function handleTriggerActivated(event: TriggerActivatedEvent): void {
  let id = event.address.toHexString();
  let entity = HeritageChainContract.load(id);
  if (entity == null) {
    return;
  }
  entity.isTriggerActivated = true;
  entity.save();
}

export function handleDistributionExecuted(event: DistributionExecutedEvent): void {
  let id = event.address.toHexString();
  let entity = HeritageChainContract.load(id);
  if (entity == null) {
    return;
  }
  entity.isDistributed = true;
  entity.save();
}

export function handleLegacyPlanCancelled(event: LegacyPlanCancelledEvent): void {
  let id = event.address.toHexString();
  let entity = HeritageChainContract.load(id);
  if (entity == null) {
    return;
  }
  // As per your AI conversation: "set isDistributed to true (as per your contract logic)"
  // and "Set isTriggerActivated to true (or a new status like "CANCELLED")"
  // For simplicity and matching the schema, we set isDistributed and isTriggerActivated to true.
  // You might want to add another field like 'status' for more detailed states (e.g., "CANCELLED").
  entity.isDistributed = true;
  entity.isTriggerActivated = true; // Or consider adding a specific 'cancelled' status if schema changes
  entity.save();
}
