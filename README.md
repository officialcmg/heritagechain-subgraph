# HeritageChain Subgraph

This project implements a subgraph for the [HeritageChain](https://github.com/officialcmg/heritagechain-foundry) protocol. It is designed to index and make queryable key events and data from the `HeritageChainFactory` and individual `HeritageChain` smart contracts.

This subgraph is a crucial component for enabling off-chain automation, particularly for the time-based trigger activation of legacy plans.

## Purpose

The primary purpose of this subgraph is to:

*   Track the creation of new `HeritageChain` contracts by the `HeritageChainFactory`.
*   Index critical events emitted by individual `HeritageChain` contracts, such as trigger settings, activations, and distributions.
*   Provide an efficient GraphQL API for querying the state of legacy plans, particularly those with pending time-based triggers.

## Key Entity Indexed

*   **`HeritageChainContract`**: Represents an individual legacy plan. It stores:
    *   `id` (Contract address)
    *   `creator` (Address of the owner)
    *   `createdAtTimestamp`
    *   `triggerType` (NONE, TIME_BASED, VOLUNTARY)
    *   `triggerTimestamp` (Deadline for TIME_BASED triggers)
    *   `isTriggerActivated` (Boolean)
    *   `isDistributed` (Boolean)

## Key Events Handled

### From `HeritageChainFactory.sol`
*   `HeritageChainCreated(address indexed creator, address contractAddress, uint256 timestamp)`: Triggers the creation of a new `HeritageChainContract` entity and starts tracking the new contract instance.

### From `HeritageChain.sol` (via template)
*   [TriggerSet(TriggerType triggerType, uint256 timestamp)](cci:1://file:///home/chris/automations/hchain/subgraph/heritagechain/src/heritage-chain.ts:17:0-41:1): Updates the trigger details for a specific plan.
*   [TriggerActivated(uint256 timestamp)](cci:1://file:///home/chris/automations/hchain/subgraph/heritagechain/src/heritage-chain.ts:43:0-51:1): Marks a plan's trigger as activated.
*   [DistributionExecuted(uint256 timestamp)](cci:1://file:///home/chris/automations/hchain/subgraph/heritagechain/src/heritage-chain.ts:53:0-61:1): Marks a plan's assets as distributed.
*   [LegacyPlanCancelled(uint256 timestamp)](cci:1://file:///home/chris/automations/hchain/subgraph/heritagechain/src/heritage-chain.ts:63:0-76:1): Marks a plan as cancelled (handled by setting `isDistributed` and `isTriggerActivated` to true).

## How It Works

1.  The subgraph listens for `HeritageChainCreated` events from the main `HeritageChainFactory` contract.
2.  When a new `HeritageChain` contract is deployed, the factory handler (`src/heritage-chain-factory.ts`) creates a `HeritageChainContract` entity and instantiates a dynamic data source (template) to start indexing events from this new contract address.
3.  Handlers in [src/heritage-chain.ts](cci:7://file:///home/chris/automations/hchain/subgraph/heritagechain/src/heritage-chain.ts:0:0-0:0) process events from these individual `HeritageChain` contracts, updating the corresponding `HeritageChainContract` entity.

## Setup & Build

### Prerequisites
*   Node.js and npm (or yarn)
*   Graph CLI: `npm install -g @graphprotocol/graph-cli` or `yarn global add @graphprotocol/graph-cli`

### Steps
1.  **Install dependencies:**
    ```bash
    npm install
    ```
    (or `yarn install`)

2.  **Generate code from schema and ABIs:**
    This step generates AssemblyScript types based on your `schema.graphql`, `subgraph.yaml`, and contract ABIs.
    ```bash
    npm run codegen
    ```

3.  **Build the subgraph:**
    This compiles the mappings to WebAssembly.
    ```bash
    npm run build
    ```

## Deployment

After a successful build, the subgraph can be deployed to:
*   The Graph Protocol's Hosted Service (deprecated for new subgraphs on mainnet but available for testnets).
*   A self-hosted Graph Node.
*   Decentralized networks supported by The Graph.

Refer to the [official Graph Protocol documentation](https://thegraph.com/docs/en/deploying/) for deployment instructions.

## Usage

This subgraph provides a GraphQL endpoint that can be queried by off-chain services (e.g., a Supabase cloud function, AWS Lambda, Google Cloud Function) to:
*   Fetch legacy plans that have time-based triggers due.
*   Check the status of any legacy plan.
*   Monitor distributions and cancellations.

Example query (to find pending time-based triggers that have passed their deadline):
```graphql
query GetEligibleContracts {
  heritageChainContracts(
    where: {
      triggerType: "TIME_BASED",
      isTriggerActivated: false,
      isDistributed: false,
      triggerTimestamp_lte: "<CURRENT_TIMESTAMP_SECONDS>"
    }
  ) {
    id # Contract address
    triggerTimestamp
  }
}