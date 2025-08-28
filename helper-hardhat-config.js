const networkConfig = {
    31337: {
        name: "localhost",
        // ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // not needed for localhost but putting a placeholder
    },
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}