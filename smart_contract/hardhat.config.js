
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/ouOeO_qqZNF2TTTSYEt9SRZ7bIVqgS-G",
      accounts: [ 'c00e8cf7c7efa7cff101745568bbdff83ee7d6601042c23359f5c656e2606b22' ],
    },
  },
};

