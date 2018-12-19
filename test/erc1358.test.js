const ERC1358 = artifacts.require('token/ERC1358');
const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const Utils = require('./utils');
const ERC1358FT = artifacts.require('token/ERC1358FTFull');
const Management = artifacts.require('ico.contracts/Management.sol');

let precision = new BigNumber("1000000000000000000");

contract('ERC1358', accounts => {

	let erc1358, ft1Address;
	let owner = accounts[0];
	let name = "tallyx_0";
	let symbol = "topp";

	beforeEach(async () => {
		erc1358 = await ERC1358.new(name, symbol, {from: owner});
	});

	it('should check metadata', async () => {
		const _name = await erc1358.name();
		assert.equal(_name, name, "name is not equal");
		const _symbol = await erc1358.symbol();
		assert.equal(_symbol, symbol, "symbol is not equal");
	});

	it('should not create Fungible Token cause decimals == 0', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 0;
		let tokenOwner = accounts[1];
		let fungibleTokenSupply = new BigNumber('1000').mul(precision);

		await erc1358.mintNFT(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create Fungible Token cause tokenOwner == address(0)', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 18;
		let tokenOwner = 0;
		let fungibleTokenSupply = new BigNumber('1000').mul(precision);

		await erc1358.mintNFT(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create Fungible Token cause fungibleTokenSupply == 0', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 18;
		let tokenOwner = accounts[1];
		let fungibleTokenSupply = new BigNumber('0').mul(precision);

		await erc1358.mintNFT(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should check Fungible Token creation', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 18;
		let tokenOwner = accounts[1];
		let fungibleTokenSupply = new BigNumber('1000').mul(precision);

		await erc1358.mintNFT(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		).then(Utils.receiptShouldSucceed);

		let ftAddress = await erc1358.ftAddresses.call(new BigNumber('0'));
		console.log('Fungible token address: ' + ftAddress);
		ft1Address = ftAddress;

		let nftValue = await erc1358.nftValues.call(new BigNumber('0'));
		assert.equal(new BigNumber(nftValue).valueOf(), fungibleTokenSupply.valueOf(), "nftValue is not equal");
	});

	it('should check burn', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 18;
		let tokenOwner = accounts[1];
		let fungibleTokenSupply = new BigNumber('1000').mul(precision);

		await erc1358.mintNFT(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		).then(Utils.receiptShouldSucceed);

		let ftAddress = await erc1358.ftAddresses.call(new BigNumber('0'));
		console.log('Fungible token address: ' + ftAddress);
		ft1Address = ftAddress;

		let nftValue = await erc1358.nftValues.call(new BigNumber('0'));
		assert.equal(new BigNumber(nftValue).valueOf(), fungibleTokenSupply.valueOf(), "nftValue is not equal");

		await erc1358.burn(tokenOwner, new BigNumber('0'))
			.then(Utils.receiptShouldSucceed);

		ftAddress = await erc1358.ftAddresses.call(new BigNumber('0'));
		assert.equal(ftAddress, 0x0, "address is not equal");

		nftValue = await erc1358.nftValue.call(new BigNumber('0'));
		assert.equal(nftValue, 0, "nftValue is not equal");
	});

	describe('Check nftValue | ftHolderBalance | ftHoldersBalances' +
		'| ftHoldersCount | ftAddress', () => {

		let firstFungible, secondFungible;

		beforeEach(async () => {
			let name_1 = "toki_1";
			let name_2 = "toki_2";
			let symbol_1 = "TK1";
			let symbol_2 = "TK2";
			let decimals = 18;
			let tokenOwner_1 = accounts[1];
			let tokenOwner_2 = accounts[2];
			let fungibleTokenSupply_1 = new BigNumber('1000').mul(precision);
			let fungibleTokenSupply_2 = new BigNumber('500').mul(precision);

			await erc1358.mintNFT(
				name_1,
				symbol_1,
				decimals,
				tokenOwner_1,
				fungibleTokenSupply_1,
				{from: owner}
			).then(Utils.receiptShouldSucceed);
			firstFungible = await erc1358.ftAddresses.call(0);

			await erc1358.mintNFT(
				name_2,
				symbol_2,
				decimals,
				tokenOwner_2,
				fungibleTokenSupply_2,
				{from: owner}
			).then(Utils.receiptShouldSucceed);
			secondFungible = await erc1358.ftAddresses.call(1);
		});

		it('should check nftValue', async () => {
			let tokenId = 0;
			let value = new BigNumber('1000').mul(precision);

			let nftValue = await erc1358.nftValue(tokenId);
			assert.equal(new BigNumber(nftValue).valueOf(), value, "nftValue is not equal");
		});

		it('should check ftHolderBalance', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;
			let holder = accounts[1];
			let holderSecond = accounts[2];
			let ftTokenInstance = await ERC1358FT.at(await erc1358.ftAddresses.call(tokenId))
			let management = Management.at(await erc1358.managementAddresses.call(tokenId))
			await management.setPermission(accounts[1],
				0,
				true,
				{from: accounts[1]}
			)
			await ftTokenInstance.mint(holder, new BigNumber('1000').mul(precision).valueOf(),{from:accounts[1]});

			let balanceOfHolder = await erc1358.ftHolderBalance(tokenId, holder);
			assert.equal(
				new BigNumber(balanceOfHolder).valueOf(),
				new BigNumber('1000').mul(precision).valueOf(),
				"balanceOfHolder is not equal"
			);
			ftTokenInstance = await ERC1358FT.at(await erc1358.ftAddresses.call(tokenIdSecond))
			management = Management.at(await erc1358.managementAddresses.call(tokenIdSecond))
			await management.setPermission(accounts[2],
				0,
				true,
				{from: accounts[2]}
			)
			await ftTokenInstance.mint(
				holderSecond,
				new BigNumber('500').mul(precision).valueOf(),
				{from: accounts[2]}
			);
			balanceOfHolder = await erc1358.ftHolderBalance(tokenIdSecond, holderSecond);
			assert.equal(
				new BigNumber(balanceOfHolder).valueOf(),
				new BigNumber('500').mul(precision).valueOf(),
				"balanceOfHolder is not equal"
			);
		});

		it('should check ftHoldersBalances', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;

			let ftTokenInstance = await ERC1358FT.at(await erc1358.ftAddresses.call(tokenId))
			let management = Management.at(await erc1358.managementAddresses.call(tokenId))
			await management.setPermission(accounts[1],
				0,
				true,
				{from: accounts[1]}
			)

			await ftTokenInstance.mint(accounts[1], new BigNumber('1000').mul(precision).valueOf(),{from:accounts[1]});
			let tokenHoldersAndBalances = await erc1358.ftHoldersBalances(tokenId, 0, 1);
			let holders = tokenHoldersAndBalances[0];
			let balances = tokenHoldersAndBalances[1];

			assert.equal(holders[0], accounts[1], "holders is not equal");
			assert.equal(new BigNumber(balances[0]).valueOf(), new BigNumber('1000').mul(precision).valueOf(), "balances is not equal");


			ftTokenInstance = await ERC1358FT.at(await erc1358.ftAddresses.call(tokenIdSecond))
			management = Management.at(await erc1358.managementAddresses.call(tokenIdSecond))
			await management.setPermission(accounts[2],
				0,
				true,
				{from: accounts[2]}
			)
			await ftTokenInstance.mint(
				accounts[2],
				new BigNumber('500').mul(precision).valueOf(),
				{from: accounts[2]}
			);

			tokenHoldersAndBalances = await erc1358.ftHoldersBalances(tokenIdSecond, 0, 1);
			holders = tokenHoldersAndBalances[0];
			balances = tokenHoldersAndBalances[1];

			assert.equal(holders[0], accounts[2], "holders is not equal");
			assert.equal(new BigNumber(balances[0]), new BigNumber('500').mul(precision).valueOf(), "balances is not equal");

			// cause _indexTo is bigger than holders count
			await erc1358.ftHoldersBalances(tokenId, 0, 2)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);
		});

		it('should check ftHoldersCount', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;

			let firstTokenHoldersCount = await erc1358.ftHoldersCount(tokenId);
			assert.equal(new BigNumber(firstTokenHoldersCount).valueOf(), 1, "holders count is not equal");

			let secondTokenHoldersCount = await erc1358.ftHoldersCount(tokenIdSecond);
			assert.equal(new BigNumber(secondTokenHoldersCount).valueOf(), 1, "holders count is not equal");
		});

		it('should check ftAddress', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;

			let firstFungibleAddress = await erc1358.ftAddress(tokenId);
			assert.equal(firstFungibleAddress, firstFungible, "fungibleToken address is not equal");

			let secondFungibleAddress = await erc1358.ftAddress(tokenIdSecond);
			assert.equal(secondFungibleAddress, secondFungible, "fungibleToken address is not equal");
		})
	});

	describe('Check NFT token flow', () => {

		const name = "toki_1";
		const symbol = "TK1";
		const decimals = 18;
		const tokenOwner = accounts[1];
		const fungibleTokenSupply = new BigNumber('1000').mul(precision);
		const tokenId = 0;
		let fungible;

		beforeEach(async () => {
			await erc1358.mintNFT(
				name,
				symbol,
				decimals,
				tokenOwner,
				fungibleTokenSupply,
				{from: owner}
			).then(Utils.receiptShouldSucceed);
			fungible = await erc1358.ftAddresses.call(0);
		})

		it('should check balanceOf', async () => {
			let balance = await erc1358.balanceOf(tokenOwner);
			assert.equal(new BigNumber(balance).valueOf(), 1, "balance is not equal");
		});

		it('should check ownerOf', async () => {
			let receiver = accounts[2]
			let ownerOfNFT = await erc1358.ownerOf(tokenId);
			assert.equal(ownerOfNFT, tokenOwner, "ownerOfNFT is not equal");

			await erc1358.transferFrom(
				tokenOwner,
				receiver,
				tokenId,
				{from: tokenOwner}
			);

			ownerOfNFT = await erc1358.ownerOf(tokenId);
			assert.equal(ownerOfNFT, receiver, "ownerOfNFT is not equal");
		});

		it('should check approve and getApproved', async () => {
			let approvalAddress = accounts[3];

			await erc1358.approve(approvalAddress, tokenId, {from: tokenOwner})
				.then(Utils.receiptShouldSucceed);

			let checkApproval = await erc1358.getApproved(tokenId);
			assert.equal(checkApproval, approvalAddress, "approval address is not equal");
		});

		it('should check setApprovalForAll and isApprovedForAll', async () => {
			let approvalAddress = accounts[3];

			await erc1358.setApprovalForAll(tokenOwner, true, {from: tokenOwner})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.setApprovalForAll(approvalAddress, true, {from: tokenOwner})
				.then(Utils.receiptShouldSucceed);

			let isApproved = await erc1358.isApprovedForAll(tokenOwner, approvalAddress);
			assert.equal(isApproved, true, "isApprovedForAll is not equal");
		});

		it('should check transferFrom', async () => {
			let approvalAddress = accounts[3];
			let receiver = accounts[4];

			await erc1358.transferFrom(tokenOwner, receiver, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.approve(approvalAddress, tokenId, {from: tokenOwner})
				.then(Utils.receiptShouldSucceed);

			await erc1358.transferFrom(tokenOwner, approvalAddress, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.transferFrom(tokenOwner, approvalAddress, tokenId, {from: accounts[2]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.transferFrom(tokenOwner, receiver, tokenId, {from: approvalAddress})
				.then(Utils.receiptShouldSucceed);

			let balanceOf = await erc1358.balanceOf(receiver);
			assert.equal(new BigNumber(balanceOf).valueOf(), 1, "balanceOf is not equal");
		});

		it('should check safeTransferFrom', async () => {
			let approvalAddress = accounts[3];
			let receiver = accounts[4];

			await erc1358.safeTransferFrom(tokenOwner, receiver, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.approve(approvalAddress, tokenId, {from: tokenOwner})
				.then(Utils.receiptShouldSucceed);

			await erc1358.safeTransferFrom(tokenOwner, approvalAddress, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.safeTransferFrom(tokenOwner, approvalAddress, tokenId, {from: accounts[2]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.safeTransferFrom(tokenOwner, receiver, tokenId, {from: approvalAddress})
				.then(Utils.receiptShouldSucceed);

			let balanceOf = await erc1358.balanceOf(receiver);
			assert.equal(new BigNumber(balanceOf).valueOf(), 1, "balanceOf is not equal");
		});

		it('should check tokenURI', async () => {
			let uri = await erc1358.tokenURI(tokenId);
			assert.equal(uri, "", "uri is not equal");
		});
	});
});
