var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "mango fresh cactus debate claim tiger business finger want music betray coil";

module.exports = {
    networks: {
      	development: {
	        host: "localhost",
	        port: 9545,
	        network_id: "*",
	        gas: 6712390, // 6000000
	        gasPrice: 10000000000, // 1000000000
      	},
      	coverage: {
          	host: "localhost",
          	network_id: "*",
          	port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
          	gas: 0xfffffffffff, // <-- Use this high gas value
          	gasPrice: 0x01      // <-- Use this low gas price
      	},
      	rinkeby: {
          	provider: function() {
            	return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/OmVpCJR7EAtCobqg8TTq")
          	},
          	network_id: 3,
          	gas: 6000000,
          	gasPrice: 10000000000
      	},
      	mainnet: {
          	provider: function () {
            	return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/a198e6030db14a4ea37864cc89dd5528")
          	},
          	network_id: 1,
          	gas: 6000000,
          	gasPrice: 4600000000
      	}
  	},
  	solc: {
      	optimizer: {
          	enabled: true,
          	runs: 200
      	}
  	},
    mocha: {
        enableTimeouts: false
    }
};
