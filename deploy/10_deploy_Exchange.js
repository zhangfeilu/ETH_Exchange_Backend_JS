const { network } = require('hardhat');
const {
  networkConfig,
  developmentChains,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');
require('dotenv').config();

module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  const initialExchangeRate = 1000;
  const tokenName = 'Testing Token';
  const tokenSymbol = 'lz404';
  const args = [initialExchangeRate, tokenName, tokenSymbol];
  log('----------------------------------------------------');
  log('Deploying ETHExchange and waiting for confirmations...');
  const ETHExchange = await deploy('ETHExchange', {
    from: deployer,
    args: args, // put price feed address
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`ETHExchange deployed at ${ETHExchange.address}`);
  log('----------------------------------------------------');
  const ethExchangeContract = await ethers.getContractAt(
    'ETHExchange',
    ETHExchange.address,
  );
  const exchangeTokenAddress =
    await ethExchangeContract.getExchangeTokenAddress();
  log(`ERC20 token deployed at ${exchangeTokenAddress}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    const erc20_args = [tokenName, tokenSymbol, ETHExchange.address];
    await verify(ETHExchange.address, args);
    await verify(exchangeTokenAddress, erc20_args);
  }
};

module.exports.tags = ['all', 'ETHExchange'];
