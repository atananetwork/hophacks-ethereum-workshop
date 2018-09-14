const ERC20 = artifacts.require('ERC20');


module.exports = function(deployer, network, accounts) {
  deployer.deploy(ERC20, 500, 'HOP', {from: accounts[0]});
}
