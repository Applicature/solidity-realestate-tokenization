const Referral = artifacts.require("ico.contracts/referral/Referral.sol");
const MintableTokenAllocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const MintableToken = artifacts.require("ico.contracts/token/erc20/MintableToken.sol");
const Management = artifacts.require("ico.contracts/Management.sol");
const Crowdsale = artifacts.require("ico.contracts/tests/CrowdsaleImplTest.sol");
const abi = require("ethereumjs-abi");
const BN = require("bn.js");
const BigNumber = require("bignumber.js");
const Utils = require("../utils");

// Contract keys
const CONTRACT_TOKEN = 1;
const CONTRACT_ALLOCATOR = 4;

// Permission keys
const CAN_MINT_TOKENS = 0;
const CAN_INTERACT_WITH_ALLOCATOR = 5;
const SIGNERS = 10;

// Precision for BigNumber (1e18)
const precision = new BigNumber("1000000000000000000").valueOf();

// Address of trx signer
const signAddress = web3.eth.accounts[0];

let icoSince = parseInt(new Date().getTime() / 1000 - 3600);
let icoTill = parseInt(new Date().getTime() / 1000) + 3600;

async function makeTransaction(instance, crowdsale, sign, address, amount) {
    "use strict";
    let h = abi.soliditySHA3(["address", "uint256"], [new BN(address.substr(2), 16), amount]),
        sig = web3.eth.sign(sign, h.toString("hex")).slice(2),
        r = `0x${sig.slice(0, 64)}`,
        s = `0x${sig.slice(64, 128)}`,
        v = web3.toDecimal(sig.slice(128, 130)) + 27;

    let data = abi.simpleEncode("claim(address,uint256,uint8,bytes32,bytes32,address)", address, amount, v, r, s, crowdsale);
    return instance.sendTransaction({from: address, data: data.toString("hex")});
}

contract("Referral", accounts => {
    let allocator;
    let referral;
    let token;
    let crowdsale;
    let management;

    beforeEach(async () => {
        management = await Management.new();

        token = await MintableToken.new(
            new BigNumber("100000").mul(precision).valueOf(),
            0,
            true,
            management.address
        );

        crowdsale = await Crowdsale.new(
            icoSince,
            icoTill,
            true,
            true,
            true,
            management.address
        );

        allocator = await MintableTokenAllocator.new(100000e18, management.address);

        referral = await Referral.new(management.address, true);

        await management.registerContract(CONTRACT_TOKEN, token.address)
            .then(Utils.receiptShouldSucceed);

        const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

        assert.equal(
            contractTokenAddress,
            token.address,
            "token address is not equal"
        );

        await management.registerSourceContract(
            CONTRACT_ALLOCATOR,
            crowdsale.address,
            allocator.address
        )
            .then(Utils.receiptShouldSucceed);

        const contractAllocatorAddress = await management
            .sourceContractRegistry
            .call(crowdsale.address, CONTRACT_ALLOCATOR);

        assert.equal(
            contractAllocatorAddress,
            allocator.address,
            "allocator address is not equal"
        );

        await management.setPermission(allocator.address, CAN_MINT_TOKENS, true)
            .then(Utils.receiptShouldSucceed);

        const allocatorPermissionToMintTokens = await management
            .permissions
            .call(allocator.address, CAN_MINT_TOKENS);

        assert.equal(
            allocatorPermissionToMintTokens,
            true,
            "allocator has not got permission to mint tokens"
        );

        await management.setPermission(referral.address, CAN_INTERACT_WITH_ALLOCATOR, true)
            .then(Utils.receiptShouldSucceed);

        const referralPermissionToInteractWithAllocator = await management
            .permissions
            .call(referral.address, CAN_INTERACT_WITH_ALLOCATOR);

        assert.equal(
            referralPermissionToInteractWithAllocator,
            true,
            "referral has not got permission to interact with allocator"
        );

        await management.setPermission(signAddress, SIGNERS, true)
            .then(Utils.receiptShouldSucceed);

        const signerPermissionToSign = await management
            .permissions
            .call(signAddress, SIGNERS);

        assert.equal(
            signerPermissionToSign,
            true,
            "signer has not got permission to sign"
        );
    });

    it("check claim", async () => {
        await makeTransaction(
            referral,
            crowdsale.address,
            signAddress,
            accounts[1],
            new BigNumber("1000").valueOf()
        )
            .then(Utils.receiptShouldSucceed);

        Utils.balanceShouldEqualTo(
            token.address,
            accounts[1],
            new BigNumber("1000").mul(precision).valueOf()
        );
    });

    it("only signers can subscribe transaction", async function () {
        await makeTransaction(
            referral,
            crowdsale.address,
            signAddress,
            accounts[1],
            new BigNumber("1000").valueOf()
        )
            .then(Utils.receiptShouldSucceed);

        await makeTransaction(
            referral,
            crowdsale.address,
            accounts[4],
            accounts[1],
            new BigNumber("1000").valueOf()
        )
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        let h = abi.soliditySHA3(
                ["address", "uint256"],
                [new BN(accounts[2].substr(2), 16), new BigNumber("9000").valueOf()]
            ),
            sig = web3.eth.sign(signAddress, h.toString("hex")).slice(2),
            r = `0x${sig.slice(0, 64)}`,
            s = `0x${sig.slice(64, 128)}`,
            v = web3.toDecimal(sig.slice(128, 130)) + 27;

        let data = abi.simpleEncode(
            "claim(address,uint256,uint8,bytes32,bytes32,address)",
            accounts[2],
            new BigNumber("1000").valueOf(),
            v,
            r,
            s,
            crowdsale.address
        );

        await referral.sendTransaction({from: accounts[2], data: data.toString("hex")})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        data = abi.simpleEncode(
            "claim(address,uint256,uint8,bytes32,bytes32,address)",
            accounts[2],
            new BigNumber("9000").valueOf(),
            v,
            r,
            s,
            crowdsale.address
        );

        await referral.sendTransaction({from: accounts[2], data: data.toString("hex")})
            .then(Utils.receiptShouldSucceed);
    });

    it("should fail if allocator is not set up (set referral in allocator)", async () => {
        await makeTransaction(
            referral,
            crowdsale.address,
            signAddress,
            accounts[0],
            new BigNumber("1000").valueOf()
        )
            .then(Utils.receiptShouldSucceed);

        await management.setPermission(referral.address, CAN_INTERACT_WITH_ALLOCATOR, false)
            .then(Utils.receiptShouldSucceed);

        const referralPermissionToInteractWithAllocator = await management
            .permissions
            .call(referral.address, CAN_INTERACT_WITH_ALLOCATOR);

        assert.equal(
            referralPermissionToInteractWithAllocator,
            false,
            "referral has permission to interact with allocator"
        );

        await makeTransaction(
            referral,
            crowdsale.address,
            signAddress,
            accounts[1],
            new BigNumber("1000").valueOf()
        )
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
    });
});
