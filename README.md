# ETH Exchange DApp

本项目是一个基于 Hardhat 的以太坊去中心化交易所（ETH Exchange）示例，允许用户在 ETH 和自定义 ERC20 代币之间进行兑换。项目包含完整的智能合约、部署脚本、测试用例和常用开发工具配置，适合学习和二次开发。

---

## 功能介绍

- **ETH ↔ ERC20 兑换**：用户可以通过发送 ETH 到合约自动获得等值的代币，也可以将代币兑换回 ETH。
- **兑换汇率可调**：合约拥有者可以随时调整 ETH 与代币的兑换比例。
- **紧急提现**：合约拥有者可紧急提取合约中的 ETH。
- **事件通知**：兑换和汇率变更等操作会触发事件，便于前端监听。
- **安全性**：集成了重入保护（ReentrancyGuard）和权限控制。

---

## 技术栈与第三方库

- **Solidity**：智能合约开发语言（主版本 ^0.8.17）。
- **OpenZeppelin Contracts**：ERC20 标准实现与安全工具库。
- **Hardhat**：以太坊开发环境，支持本地测试、部署、调试。
- **hardhat-deploy**：简化部署流程与网络管理。
- **ethers.js**：与以太坊节点和合约交互。
- **Chai**：断言库，用于测试。
- **dotenv**：环境变量管理。
- **solidity-coverage**：合约测试覆盖率工具。
- **hardhat-gas-reporter**：Gas 消耗报告。
- **ESLint/Prettier/Solhint**：代码风格和安全规范工具。

---

## 目录结构

```
contracts/           # 智能合约源码
  ETHExchange.sol    # 主兑换合约
  ExchangeToken.sol  # 自定义 ERC20 代币
deploy/              # 部署脚本
test/                # 测试用例
scripts/             # 调试脚本
utils/               # 工具函数（如合约验证）
hardhat.config.js    # Hardhat 配置
helper-hardhat-config.js # 网络与辅助配置
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 编译合约

```bash
npx hardhat compile
```

### 3. 本地测试

```bash
npx hardhat test
```

### 4. 本地部署

```bash
npx hardhat node
# 新终端
npx hardhat deploy --network localhost
```

### 5. 交互与调试

可使用 [scripts/debug.js](scripts/debug.js) 脚本与合约交互：

```bash
npx hardhat run scripts/debug.js --network localhost
```

### 6. Etherscan 验证

配置 `.env` 文件，填入 ETHERSCAN_API_KEY、PRIVATE_KEY、RPC_URL 等信息。部署到测试网后自动验证合约：

```bash
npx hardhat deploy --network sepolia
```

---

## 主要合约说明

- [`ETHExchange`](contracts/ETHExchange.sol)：主兑换合约，负责 ETH 与代币的兑换逻辑、汇率管理和紧急提现。
- [`ExchangeToken`](contracts/ExchangeToken.sol)：自定义 ERC20 代币，仅允许兑换合约铸造和销毁。

---

## 重要脚本

- 部署脚本：[deploy/10_deploy_Exchange.js](deploy/10_deploy_Exchange.js)
- 合约验证工具：[utils/verify.js](utils/verify.js)
- 测试用例：[test/exchange-test.js](test/exchange-test.js)

---

## 贡献与开发建议

- 遵循 [Solhint](.solhint.json)、[ESLint](.eslintrc.js)、[Prettier](.prettierrc) 规范。
- 所有合约和脚本均可扩展，适合二次开发和学习。

---

## License
