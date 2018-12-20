module.exports = {
    skipFiles: [
        'Migrations.sol',
        'test/SimpleToken.sol',
        'ico.contracts/tests/AllocationLockupContractTest.sol',
        'ico.contracts/tests/ClaimableContributionForwarderTest.sol',
        'ico.contracts/tests/CrowdsaleAgentTest.sol',
        'ico.contracts/tests/CrowdsaleImplTest.sol',
        'ico.contracts/tests/DividendsMock.sol',
        'ico.contracts/tests/ExchangeContractTest.sol',
        'ico.contracts/tests/HardCappedCrowdsaleTest.sol',
        'ico.contracts/tests/LockupContractTest.sol',
        'ico.contracts/tests/ManagedTest.sol',
        'ico.contracts/tests/MintableCrowdsaleOnSuccessAgentTest.sol',
        'ico.contracts/tests/PausableTokenTest.sol',
        'ico.contracts/tests/PricingStrategyImplTest.sol',
        'ico.contracts/tests/RCrowdsaleTest.sol',
        'ico.contracts/tests/TimeLockedTokenTest.sol',
        'ico.contracts/tests/TokenAllocatorTest.sol',
        'test.sol',
        'doc_examples.sol',
        'double-quoted.sol',
        'single-quoted.sol'
    ],
    // need for dependencies
    copyNodeModules: true,
    copyPackages: [
        'zeppelin-solidity'
    ],
    dir: '.',
    buildDirPath: '/build/contracts',
    norpc: false
};
