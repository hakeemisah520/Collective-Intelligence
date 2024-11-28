import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Stacks functions
vi.mock('@stacks/transactions', () => ({
  makeContractCall: vi.fn(() => Promise.resolve({ txid: 'mock-txid' })),
  broadcastTransaction: vi.fn(() => Promise.resolve({ txid: 'mock-txid' })),
  callReadOnlyFunction: vi.fn(() => Promise.resolve({
    value: {
      creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      title: 'Test Problem',
      description: 'This is a test problem',
      bounty: 100000000,
      status: 'open'
    }
  })),
  standardPrincipalCV: vi.fn(address => ({ type: 'principal', address })),
  uintCV: vi.fn(value => ({ type: 'uint', value })),
  stringAsciiCV: vi.fn(value => ({ type: 'string-ascii', value })),
}));

const {
  makeContractCall,
  broadcastTransaction,
  callReadOnlyFunction,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
} = await import('@stacks/transactions');

const CONTRACT_NAME = 'collective-intelligence';
const DEPLOYER_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const USER1_ADDRESS = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
const USER2_ADDRESS = 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC';

describe('Collective Intelligence Platform', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should submit a problem', async () => {
    const result = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'submit-problem',
      functionArgs: [
        stringAsciiCV('Test Problem'),
        stringAsciiCV('This is a test problem'),
        uintCV(100000000), // 1 STX
      ],
      senderKey: 'user1-private-key',
    });
    
    expect(result.txid).toBeDefined();
    expect(makeContractCall).toHaveBeenCalledTimes(1);
  });
  
  it('should propose a solution', async () => {
    const result = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'propose-solution',
      functionArgs: [
        uintCV(1), // problem_id
        stringAsciiCV('This is a test solution'),
      ],
      senderKey: 'user2-private-key',
    });
    
    expect(result.txid).toBeDefined();
    expect(makeContractCall).toHaveBeenCalledTimes(1);
  });
  
  it('should vote on a solution', async () => {
    const result = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'vote-solution',
      functionArgs: [uintCV(1)], // solution_id
      senderKey: 'user1-private-key',
    });
    
    expect(result.txid).toBeDefined();
    expect(makeContractCall).toHaveBeenCalledTimes(1);
  });
  
  it('should close a problem', async () => {
    const result = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'close-problem',
      functionArgs: [uintCV(1)], // problem_id
      senderKey: 'user1-private-key',
    });
    
    expect(result.txid).toBeDefined();
    expect(makeContractCall).toHaveBeenCalledTimes(1);
  });
  
  it('should get problem information', async () => {
    const result = await callReadOnlyFunction({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-problem',
      functionArgs: [uintCV(1)],
      senderAddress: USER1_ADDRESS,
    });
    
    expect(result).toBeDefined();
    expect(result.value).toHaveProperty('creator');
    expect(result.value).toHaveProperty('title');
    expect(result.value).toHaveProperty('description');
    expect(result.value).toHaveProperty('bounty');
    expect(result.value).toHaveProperty('status');
  });
  
  it('should get solution information', async () => {
    vi.mocked(callReadOnlyFunction).mockResolvedValueOnce({
      value: {
        'problem-id': 1,
        creator: USER2_ADDRESS,
        content: 'This is a test solution',
        votes: 0
      }
    });
    
    const result = await callReadOnlyFunction({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-solution',
      functionArgs: [uintCV(1)],
      senderAddress: USER1_ADDRESS,
    });
    
    expect(result).toBeDefined();
    expect(result.value).toHaveProperty('problem-id');
    expect(result.value).toHaveProperty('creator');
    expect(result.value).toHaveProperty('content');
    expect(result.value).toHaveProperty('votes');
  });
  
  it('should not allow unauthorized users to close a problem', async () => {
    vi.mocked(makeContractCall).mockRejectedValueOnce(new Error('Unauthorized'));
    
    await expect(makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'close-problem',
      functionArgs: [uintCV(1)], // problem_id
      senderKey: 'user2-private-key', // Different user than the problem creator
    })).rejects.toThrow('Unauthorized');
  });
  
  it('should not allow voting on non-existent solutions', async () => {
    vi.mocked(makeContractCall).mockRejectedValueOnce(new Error('Solution not found'));
    
    await expect(makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'vote-solution',
      functionArgs: [uintCV(999)], // Non-existent solution_id
      senderKey: 'user1-private-key',
    })).rejects.toThrow('Solution not found');
  });
});

