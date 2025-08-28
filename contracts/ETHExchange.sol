// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./ExchangeToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ETHExchange is ReentrancyGuard {
 ExchangeToken public exchangeToken;
 uint256 public exchangeRate;
 address public owner;

 modifier onlyOwner(){
    require(msg.sender == owner, "Only owner can call this function");
    _;
 }

 event EthToToken(address indexed sender, uint256 ethAmount, uint256 tokenAmount);
 event TokenToEth(address indexed sender, uint256 tokenAmount, uint256 ethAmount);

 event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);

 constructor(uint256 _initialRate, string memory tokenName, string memory tokenSymbol) {
    owner = msg.sender;
    exchangeRate = _initialRate;
    exchangeToken = new ExchangeToken(tokenName, tokenSymbol, address(this));
 }

 receive() external payable nonReentrant {
    require(msg.value > 0, "Must send ETH to get tokens");
    uint256 tokenAmount = msg.value * exchangeRate;
    exchangeToken.mint(msg.sender, tokenAmount);
    emit EthToToken(msg.sender, msg.value, tokenAmount);
 }

 function exchangeTokenToEth(uint256 tokenAmount) external nonReentrant{
    require(tokenAmount > 0, "Must send tokens to get ETH");
    uint256 ethAmount = tokenAmount / exchangeRate;
    require(address(this).balance >= ethAmount, "Contract does not have enough ETH");

    exchangeToken.burn(msg.sender, tokenAmount);
    (bool success,) = payable(msg.sender).call{value: ethAmount}("");
    require(success, "ETH transfer failed");
    emit TokenToEth(msg.sender, tokenAmount, ethAmount);
 }

 function setExchangeRate(uint256 _newRate) external onlyOwner {
    require(_newRate > 0, "Exchange rate must be greater than 0");
    uint256 oldRate = exchangeRate;
    exchangeRate = _newRate;
    emit ExchangeRateUpdated(oldRate, _newRate);
 }

 function emergencyWithdraw(uint256 amount) external onlyOwner nonReentrant {
    require(amount >0, "Amount must be greater than 0");
    require(address(this).balance >= amount, "Not enough ETH in contract");
    (bool success,) = payable(owner).call{value: amount}("");
    require(success, "ETH transfer failed");
 }

}