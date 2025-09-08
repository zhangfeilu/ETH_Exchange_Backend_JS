// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ExchangeToken is ERC20 {
    address public exchangeContract;
    modifier onlyExchangeContract() {
        require(msg.sender == exchangeContract, "Only exchange contract can call this function");
        _;
    }   

    constructor(string memory name, string memory symbol, address _exchangeContract) ERC20(name, symbol) {
        exchangeContract = _exchangeContract;        
    }

    function mint(address to, uint256 amount) external onlyExchangeContract {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyExchangeContract {
        _burn(from, amount);
    }

    function setExchangeContract(address _exchangeContract) external onlyExchangeContract {
        exchangeContract = _exchangeContract;
    }
    
    function decimals() public pure override returns (uint8) {
        return 18;
  }
}