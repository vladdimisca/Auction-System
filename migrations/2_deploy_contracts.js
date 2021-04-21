const Auction = artifacts.require("./Auction.sol");

module.exports = function(deployer) {
  deployer.deploy(Auction, 1618855115, 3718855115);
};
