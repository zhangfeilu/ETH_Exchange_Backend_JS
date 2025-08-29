const hre = require('hardhat');

async function main() {
  // Contract address from deployment (replace with yours)
  const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

  // Get the contract factory (to access ABI)
  const MyContract = await hre.ethers.getContractFactory('ETHExchange');

  // Attach to the deployed contract
  const myContract = await MyContract.attach(CONTRACT_ADDRESS);

  // Example 1: Call a read-only method (view/pure)
  const value = await myContract.exchangeRate(); // Replace with your method
  console.log('Current value:', value.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
