const { expect } = require('chai');
const { ethers, network, getNamedAccounts } = require('hardhat');

describe('test ETHExchange contract', function () {
  let ETHExchangeContract;
  let ethExchange;
  let ExchangeTokenContract;
  let exchangeToken;
  let owner;
  let addr1;
  let addr2;
  let initialExchangeRate;

  const symbolName = 'lz404';
  const tokenName = 'Testing Token';

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    initialExchangeRate = 1000;
    ETHExchangeContract = await ethers.getContractFactory('ETHExchange');
    ethExchange = await ETHExchangeContract.deploy(
      initialExchangeRate,
      tokenName,
      symbolName,
    );
    await ethExchange.deployed();

    const tokenAddress = await ethExchange.exchangeToken();
    ExchangeTokenContract = await ethers.getContractFactory('ExchangeToken');
    exchangeToken = await ExchangeTokenContract.attach(tokenAddress);
  });

  describe('test contract deployment', function () {
    it('Should set the right owner', async function () {
      expect(await ethExchange.owner()).to.equal(owner.address);
    });

    it('Should set the correct initial exchange rate', async function () {
      expect(await ethExchange.exchangeRate()).to.equal(initialExchangeRate);
    });

    it('Should have a token contract', async function () {
      const tokenAddress = await ethExchange.exchangeToken();
      expect(tokenAddress).to.be.properAddress;
    });

    describe('ETH to Token Exchange', function () {
      it('Should issue tokens when ETH is sent', async function () {
        const ethAmount = ethers.utils.parseEther('1.0');
        await addr1.sendTransaction({
          to: ethExchange.address,
          value: ethAmount,
        });

        let expectedTokens = ethers.utils.parseEther('1000'); // 1 ETH * 1000 rate
        let actualTokens = await exchangeToken.balanceOf(addr1.address);
        expect(actualTokens).to.equal(expectedTokens);
      });

      it('Should emit EthToToken event', async function () {
        const ethAmount = ethers.utils.parseEther('0.5');
        await expect(
          addr1.sendTransaction({
            to: ethExchange.address,
            value: ethAmount,
          }),
        )
          .to.emit(ethExchange, 'EthToToken')
          .withArgs(
            addr1.address,
            ethAmount,
            ethers.utils.parseEther('500.0'), // 0.5 * 1000
          );
      });

      it('Should reject zero ETH', async function () {
        await expect(
          addr1.sendTransaction({
            to: ethExchange.address,
            value: 0,
          }),
        ).to.be.revertedWith('Must send ETH to get tokens');
      });
    });

    describe('Token to ETH Exchange', function () {
      beforeEach(async function () {
        const ethAmount = ethers.utils.parseEther('1.0');
        await addr1.sendTransaction({
          to: ethExchange.address,
          value: ethAmount,
        });
      });

      it('Should exchange tokens for ETH', async function () {
        const initialEthBalance = await ethers.provider.getBalance(
          addr1.address,
        );

        const tokenAmount = ethers.utils.parseEther('500.0');

        await exchangeToken
          .connect(addr1)
          .approve(ethExchange.address, tokenAmount);

        const tx = await ethExchange
          .connect(addr1)
          .exchangeTokenToEth(tokenAmount);
        const receipt = await tx.wait();

        const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

        expect(await exchangeToken.balanceOf(addr1.address)).to.equal(
          ethers.utils.parseEther('500.0'),
        );

        const finalEthBalance = await ethers.provider.getBalance(addr1.address);
        const expectedEthIncrease = ethers.utils.parseEther('0.5').sub(gasUsed);

        expect(finalEthBalance.sub(initialEthBalance)).to.be.closeTo(
          expectedEthIncrease,
          ethers.utils.parseEther('0.001'),
        );
      });

      it('Should emit TokenToEth event', async function () {
        const tokenAmount = ethers.utils.parseEther('500.0');
        await exchangeToken
          .connect(addr1)
          .approve(ethExchange.address, tokenAmount);

        await expect(ethExchange.connect(addr1).exchangeTokenToEth(tokenAmount))
          .to.emit(ethExchange, 'TokenToEth')
          .withArgs(
            addr1.address,
            tokenAmount,
            ethers.utils.parseEther('0.5'), // 500 / 1000
          );
      });

      it('Should reject insufficient tokens', async function () {
        const tokenAmount = ethers.utils.parseEther('2000.0');
        await exchangeToken
          .connect(addr1)
          .approve(ethExchange.address, tokenAmount);

        await expect(
          ethExchange.connect(addr1).exchangeTokenToEth(tokenAmount),
        ).to.be.revertedWith('Contract does not have enough ETH');
      });

      it('Should reject if contract has insufficient ETH', async function () {
        const balanceInWei = await ethers.provider.getBalance(
          ethExchange.address,
        );
        console.log(
          'ethExchange balance:',
          ethers.utils.formatEther(balanceInWei),
        );
        const ethAmount = ethers.utils.parseEther('2.0');
        await addr1.sendTransaction({
          to: ethExchange.address,
          value: ethAmount,
        });

        const ethAmount2 = ethers.utils.parseEther('1.5');
        await addr2.sendTransaction({
          to: ethExchange.address,
          value: ethAmount2,
        });

        const tokenAmount2 = ethers.utils.parseEther('1500.0');
        await exchangeToken
          .connect(addr2)
          .approve(ethExchange.address, tokenAmount2);
        await ethExchange.connect(addr2).exchangeTokenToEth(tokenAmount2);

        const tokenAmount = ethers.utils.parseEther('3500.0'); // not 2500, since we send 1 ether in the beforeEach
        await exchangeToken
          .connect(addr1)
          .approve(ethExchange.address, tokenAmount);

        await expect(
          ethExchange.connect(addr1).exchangeTokenToEth(tokenAmount),
        ).to.be.revertedWith('Contract does not have enough ETH');
      });
    });

    describe('Owner Functions', function () {
      it('Should allow owner to update exchange rate', async function () {
        const newRate = ethers.utils.parseEther('2000');
        await ethExchange.setExchangeRate(newRate);
        expect(await ethExchange.exchangeRate()).to.equal(newRate);
      });

      it('Should emit ExchangeRateUpdated event', async function () {
        const newRate = ethers.utils.parseEther('2000');
        const oldRate = await ethExchange.exchangeRate();
        await expect(ethExchange.setExchangeRate(newRate))
          .to.emit(ethExchange, 'ExchangeRateUpdated')
          .withArgs(oldRate, newRate);
      });

      it('Should not allow non-owners to update exchange rate', async function () {
        const newRate = ethers.utils.parseEther('2000');
        await expect(
          ethExchange.connect(addr1).setExchangeRate(newRate),
        ).to.be.revertedWith('Only owner can call this function');
      });

      it('Should allow owner to emergency withdraw ETH', async function () {
        await addr1.sendTransaction({
          to: ethExchange.address,
          value: ethers.utils.parseEther('1.0'),
        });

        const initialOwnerBalance = await ethers.provider.getBalance(
          owner.address,
        );

        const withdrawAmount = ethers.utils.parseEther('0.5');
        const tx = await ethExchange.emergencyWithdraw(withdrawAmount);
        const receipt = await tx.wait();

        const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

        const finalOwnerBalance = await ethers.provider.getBalance(
          owner.address,
        );
        expect(finalOwnerBalance).to.equal(
          initialOwnerBalance.add(withdrawAmount).sub(gasUsed),
        );

        const contractBalance = await ethers.provider.getBalance(
          ethExchange.address,
        );
        expect(contractBalance).to.equal(ethers.utils.parseEther('0.5'));
      });

      it('Should not allow non-owners to emergency withdraw', async function () {
        await expect(
          ethExchange
            .connect(addr1)
            .emergencyWithdraw(ethers.utils.parseEther('0.1')),
        ).to.be.revertedWith('Only owner can call this function');
      });
    });
  });
});
