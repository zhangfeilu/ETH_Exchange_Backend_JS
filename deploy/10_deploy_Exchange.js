const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments,ethers }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const initialExchangeRate = hre.ethers.utils.parseEther("1000");
    const tokenName = "Testing Token"
    const tokenSymbol = "lz404";
    log("----------------------------------------------------")
    log("Deploying ETHExchange and waiting for confirmations...")
    const ETHExchange = await deploy("ETHExchange", {
        from: deployer,
        args: [initialExchangeRate,tokenName,tokenSymbol], // put price feed address
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`ETHExchange deployed at ${ETHExchange.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}

module.exports.tags = ["all", "ETHExchange"]
