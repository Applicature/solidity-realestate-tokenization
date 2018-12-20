const DistributedDirectContributionForwarder = artifacts
    .require("ico.contracts/contribution/DistributedDirectContributionForwarder.sol");
const DirectContributionForwarder = artifacts.require("ico.contracts/contribution/DirectContributionForwarder.sol");
const ClaimableContributionForwarder = artifacts.require("ico.contracts/tests/ClaimableContributionForwarderTest.sol");
const Management = artifacts.require("ico.contracts/Management.sol");
const Utils = require("../utils");
const BigNumber = require("bignumber.js");

contract("ContributionForwarder", accounts => {

    describe("DistributedDirectContributionForwarder", () => {
        it("it should forward to receivers", async () => {
            const owner = accounts[0];
            const receiver1 = accounts[2];
            const receiver2 = accounts[3];
            const proportionAbsMax = 100;
            const receivers = [receiver1, receiver2];
            const proportions = [90, 10];

            const management = await Management.new();
            const forwarder = await DistributedDirectContributionForwarder.new(
                proportionAbsMax,
                receivers,
                proportions,
                management.address
            );

            let res = await web3.eth.getBalance(receiver1);
            const balance1Before = new BigNumber(res.valueOf());

            res = await web3.eth.getBalance(receiver2);
            const balance2Before = new BigNumber(res.valueOf());

            await forwarder.forward({
                from: owner,
                value: web3.toWei("0.000000000001", "ether")
            })
                .then(Utils.receiptShouldSucceed);

            const balanceShouldBe1 = balance1Before.plus(new BigNumber(900000));
            const balanceShouldBe2 = balance2Before.plus(new BigNumber(100000));

            res = await web3.eth.getBalance(receiver1);

            assert.equal(
                res.valueOf() === balanceShouldBe1.toString(),
                true,
                "balance doesn't match"
            );

            res = await web3.eth.getBalance(receiver2);

            assert.equal(
                res.valueOf() === balanceShouldBe2.toString(),
                true,
                "balance doesn't match"
            );
        });
    });

    describe("DirectContributionForwarderTest", () => {
        it("it should forward to receiver", async () => {
            const owner = accounts[0];
            const receiver = accounts[2];

            const management = await Management.new();
            const forwarder = await DirectContributionForwarder.new(receiver, management.address);

            let weiForwarded = await forwarder.weiForwarded.call();
            assert.equal(weiForwarded.valueOf(), 0, "weiForwarded is not equal");

            let res = await web3.eth.getBalance(receiver);
            const balanceBefore = new BigNumber(res.valueOf());

            await forwarder.forward({
                from: owner,
                value: web3.toWei("0.000000000001", "ether")
            })
                .then(Utils.receiptShouldSucceed);

            const balanceShouldBe = balanceBefore.plus(new BigNumber(1000000));

            res = await web3.eth.getBalance(receiver);
            assert.equal(res.valueOf() === balanceShouldBe.toString(), true, "balance doesn't match");

            weiForwarded = await forwarder.weiForwarded.call();
            assert.equal(weiForwarded.valueOf(), 1000000, "weiForwarded is not equal");
        });
    });

    describe("ClaimableContributionForwarder", () => {
        it("it should transfer to receivers", async () => {
            const owner = accounts[0];
            const receiver = accounts[2];

            const management = await Management.new();
            const forwarder = await ClaimableContributionForwarder.new(receiver, management.address);
            let weiForwarded = await forwarder.weiForwarded.call();
            assert.equal(weiForwarded.valueOf(), 0, "weiForwarded is not equal");
            let contractBalance = await web3.eth.getBalance(forwarder.address);
            assert.equal(contractBalance.valueOf(), 0, "contractBalance is not equal");

            await forwarder.increaseBalanceTest({value: web3.toWei("0.000000000001", "ether")})
                .then(Utils.receiptShouldSucceed);

            contractBalance = await web3.eth.getBalance(forwarder.address);
            assert.equal(contractBalance.valueOf(), 1000000, "contractBalance is not equal");

            let res = await web3.eth.getBalance(receiver);
            const balanceBefore = new BigNumber(res.valueOf());

            await forwarder.transfer({from: owner})
                .then(Utils.receiptShouldSucceed);

            const balanceShouldBe = balanceBefore.plus(new BigNumber(1000000));

            res = await web3.eth.getBalance(receiver);
            assert.equal(res.valueOf() === balanceShouldBe.toString(), true, "balance doesn't match");

            weiForwarded = await forwarder.weiForwarded.call();
            assert.equal(weiForwarded.valueOf(), 1000000, "weiForwarded is not equal");
        });
    });
});
