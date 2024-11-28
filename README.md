# Collective Intelligence Platform

## Overview
A decentralized platform for collaborative problem-solving on the Stacks blockchain, enabling users to submit problems, propose solutions, and vote on potential solutions.

## Key Features
- Problem Submission with Bounty
- Solution Proposing
- Solution Voting
- Problem Closing

## Smart Contract Functions

### Problem Management
- `submit-problem`: Create a new problem with a title, description, and bounty
- `close-problem`: Close a problem (only by problem creator)
- `get-problem`: Retrieve problem details

### Solution Management
- `propose-solution`: Submit a solution to a specific problem
- `vote-solution`: Vote for a proposed solution
- `get-solution`: Retrieve solution details

## Workflow
1. User submits a problem with a bounty
2. Other users propose solutions
3. Community votes on solutions
4. Problem creator can close the problem

## Security Features
- Only problem creator can close their problem
- Prevents unauthorized actions
- Bounty transferred to contract upon problem submission

## Limitations
- Solution character limit: 2000 characters
- Problem title: 100 characters
- Problem description: 1000 characters

## Error Handling
- `ERR_NOT_FOUND` (404): When problem or solution doesn't exist
- `ERR_UNAUTHORIZED` (403): Unauthorized action attempt
