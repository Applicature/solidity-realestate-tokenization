const Managed = artifacts.require("ico.contracts/tests/ManagedTest.sol");
const Management = artifacts.require("ico.contracts/Management.sol");
const Utils = require("../utils.js");

contract("Managed", accounts => {

    it("should succeed as caller is not a contract", async () => {
        const management = await Management.new();
        const managed = await Managed.new(management.address);

        await managed.checkNotContractSenderIsTrue()
            .then(Utils.receiptShouldSucceed);

        assert.equal((await managed.notContract.call()).valueOf(), true, "result doesn't match");
        assert.equal(await managed.caller.call(), accounts[0], "caller is not equal");
    });

    it("should succeed as caller is not a contract", async () => {
        const managed = await Managed.new(0);
        assert.equal(await managed.management.call(), 0, "management doesn't match");

        const management = await Management.new();

        await managed.setManagementContract(management.address)
            .then(Utils.receiptShouldSucceed);

        assert.equal(await managed.management.call(), management.address, "management doesn't match");
    });
});
