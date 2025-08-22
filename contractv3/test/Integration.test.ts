import { describe, it, beforeEach } from "node:test";
import { strict as assert } from "node:assert";
import { network } from "hardhat";
import { formatUnits, parseUnits, getAddress } from "viem";

/**
 * Genesis NFT BlindBox 集成测试
 * 
 * 测试覆盖：
 * 1. 完整的部署流程
 * 2. 端到端的用户交互流程
 * 3. 多用户并发场景
 * 4. 边界条件和异常情况
 * 5. 完整的生命周期测试
 */

describe("Genesis NFT BlindBox 集成测试", () => {
  let gemToken: any;
  let genesisMecha: any;
  let blindBox: any;
  let deployer: any;
  let user1: any;
  let user2: any;
  let user3: any;
  let publicClient: any;
  let MINTER_ROLE: string;
  let DEFAULT_ADMIN_ROLE: string;

  beforeEach(async () => {
    const { viem } = await network.connect();
    
    // 获取测试账户
    const walletClients = await viem.getWalletClients();
    [deployer, user1, user2, user3] = walletClients;
    
    publicClient = await viem.getPublicClient();
    
    // 角色常量
    MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  });

  describe("完整部署流程", () => {
    it("应该能够完整部署所有合约并正确配置", async () => {
      const { viem } = await network.connect();
      
      // 1. 部署 GemToken
      gemToken = await viem.deployContract("GemToken", [deployer.account.address]);
      
      // 验证 GemToken 部署
      const gemName = await gemToken.read.name();
      const gemSymbol = await gemToken.read.symbol();
      const gemDecimals = await gemToken.read.decimals();
      
      assert.equal(gemName, "Gem Token");
      assert.equal(gemSymbol, "GEM");
      assert.equal(gemDecimals, 6);
      
      // 2. 部署 GenesisMecha
      genesisMecha = await viem.deployContract("GenesisMecha", [
        deployer.account.address,
        deployer.account.address
      ]);
      
      // 验证 GenesisMecha 部署
      const nftName = await genesisMecha.read.name();
      const nftSymbol = await genesisMecha.read.symbol();
      const maxSupply = await genesisMecha.read.MAX_SUPPLY();
      
      assert.equal(nftName, "Genesis Mecha");
      assert.equal(nftSymbol, "GMECHA");
      assert.equal(maxSupply.toString(), "20");
      
      // 3. 部署 BlindBox
      const initialMintPrice = parseUnits("100", 6);
      blindBox = await viem.deployContract("BlindBox", [
        gemToken.address,
        genesisMecha.address,
        initialMintPrice,
        deployer.account.address
      ]);
      
      // 验证 BlindBox 部署
      const mintPrice = await blindBox.read.mintPrice();
      const contractOwner = await blindBox.read.owner();
      
      assert.equal(mintPrice.toString(), initialMintPrice.toString());
      assert.equal(getAddress(contractOwner), getAddress(deployer.account.address));
      
      // 4. 配置权限
      let hash = await genesisMecha.write.grantRole([MINTER_ROLE, blindBox.address]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const hasMinterRole = await genesisMecha.read.hasRole([MINTER_ROLE, blindBox.address]);
      assert.equal(hasMinterRole, true);
      
      // 5. 初始化设置
      hash = await gemToken.write.mint([deployer.account.address, parseUnits("10000", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const deployerBalance = await gemToken.read.balanceOf([deployer.account.address]);
      assert.ok(deployerBalance > parseUnits("10000000", 6)); // 包含初始供应量
      
      // 6. 设置元数据 URI
      const baseURI = "https://api.genesis-nft.com/metadata/";
      hash = await genesisMecha.write.setBaseURI([baseURI]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const currentBaseURI = await genesisMecha.read.getBaseURI();
      assert.equal(currentBaseURI, baseURI);
    });
  });

  describe("端到端用户交互流程", () => {
    beforeEach(async () => {
      // 部署和配置所有合约
      const { viem } = await network.connect();
      
      gemToken = await viem.deployContract("GemToken", [deployer.account.address]);
      genesisMecha = await viem.deployContract("GenesisMecha", [deployer.account.address, deployer.account.address]);
      blindBox = await viem.deployContract("BlindBox", [
        gemToken.address,
        genesisMecha.address,
        parseUnits("100", 6),
        deployer.account.address
      ]);
      
      // 配置权限和初始设置
      let hash = await genesisMecha.write.grantRole([MINTER_ROLE, blindBox.address]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await gemToken.write.mint([deployer.account.address, parseUnits("20000", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await genesisMecha.write.setBaseURI(["https://api.genesis-nft.com/metadata/"]);
      await publicClient.waitForTransactionReceipt({ hash });
    });

    it("应该支持完整的用户购买流程", async () => {
      // 1. 部署者给用户转账 GEM
      let hash = await gemToken.write.transfer([user1.account.address, parseUnits("1000", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const user1Balance = await gemToken.read.balanceOf([user1.account.address]);
      assert.equal(user1Balance.toString(), parseUnits("1000", 6).toString());
      
      // 2. 用户授权 BlindBox 合约
      hash = await gemToken.write.approve([blindBox.address, parseUnits("500", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const allowance = await gemToken.read.allowance([user1.account.address, blindBox.address]);
      assert.equal(allowance.toString(), parseUnits("500", 6).toString());
      
      // 3. 用户购买盲盒
      hash = await blindBox.write.purchaseBlindBox([3n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 4. 验证购买结果
      const finalGemBalance = await gemToken.read.balanceOf([user1.account.address]);
      const nftBalance = await genesisMecha.read.balanceOf([user1.account.address]);
      const totalSupply = await genesisMecha.read.totalSupply();
      
      assert.equal(finalGemBalance.toString(), parseUnits("700", 6).toString()); // 1000 - 300
      assert.equal(nftBalance.toString(), "3");
      assert.equal(totalSupply.toString(), "3");
      
      // 5. 验证 NFT 元数据
      for (let i = 1; i <= 3; i++) {
        const owner = await genesisMecha.read.ownerOf([BigInt(i)]);
        const tokenURI = await genesisMecha.read.tokenURI([BigInt(i)]);
        
        assert.equal(getAddress(owner), getAddress(user1.account.address));
        assert.ok(tokenURI.includes("https://api.genesis-nft.com/metadata/"));
        assert.ok(tokenURI.includes(".json"));
      }
    });

    it("应该支持多用户并发购买", async () => {
      // 给多个用户分配 GEM
      let hash = await gemToken.write.transfer([user1.account.address, parseUnits("1000", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await gemToken.write.transfer([user2.account.address, parseUnits("800", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await gemToken.write.transfer([user3.account.address, parseUnits("600", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 用户授权
      hash = await gemToken.write.approve([blindBox.address, parseUnits("500", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await gemToken.write.approve([blindBox.address, parseUnits("400", 6)], {
        account: user2.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await gemToken.write.approve([blindBox.address, parseUnits("300", 6)], {
        account: user3.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 并发购买
      hash = await blindBox.write.purchaseBlindBox([2n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await blindBox.write.purchaseBlindBox([3n], {
        account: user2.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await blindBox.write.purchaseBlindBox([1n], {
        account: user3.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 验证结果
      const user1NftBalance = await genesisMecha.read.balanceOf([user1.account.address]);
      const user2NftBalance = await genesisMecha.read.balanceOf([user2.account.address]);
      const user3NftBalance = await genesisMecha.read.balanceOf([user3.account.address]);
      const totalSupply = await genesisMecha.read.totalSupply();
      
      assert.equal(user1NftBalance.toString(), "2");
      assert.equal(user2NftBalance.toString(), "3");
      assert.equal(user3NftBalance.toString(), "1");
      assert.equal(totalSupply.toString(), "6");
      
      // 验证收益
      const contractRevenue = await gemToken.read.balanceOf([blindBox.address]);
      const expectedRevenue = parseUnits("600", 6); // (2+3+1) * 100
      assert.equal(contractRevenue.toString(), expectedRevenue.toString());
    });

    it("应该正确处理售罄场景", async () => {
      // 给用户足够的 GEM 购买所有 NFT
      let hash = await gemToken.write.transfer([user1.account.address, parseUnits("2500", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await gemToken.write.approve([blindBox.address, parseUnits("2500", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 购买大部分 NFT
      hash = await blindBox.write.purchaseBlindBox([10n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await blindBox.write.purchaseBlindBox([10n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 验证售罄状态
      const totalSupply = await genesisMecha.read.totalSupply();
      const remainingSupply = await genesisMecha.read.remainingSupply();
      const isSoldOut = await genesisMecha.read.isSoldOut();
      const remainingIndices = await blindBox.read.getRemainingIndices();
      
      assert.equal(totalSupply.toString(), "20");
      assert.equal(remainingSupply.toString(), "0");
      assert.equal(isSoldOut, true);
      assert.equal(remainingIndices.toString(), "0");
      
      // 尝试再次购买应该失败
      try {
        await blindBox.write.purchaseBlindBox([1n], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Not enough NFTs remaining"));
      }
    });
  });

  describe("管理功能集成测试", () => {
    beforeEach(async () => {
      // 部署和配置所有合约
      const { viem } = await network.connect();
      
      gemToken = await viem.deployContract("GemToken", [deployer.account.address]);
      genesisMecha = await viem.deployContract("GenesisMecha", [deployer.account.address, deployer.account.address]);
      blindBox = await viem.deployContract("BlindBox", [
        gemToken.address,
        genesisMecha.address,
        parseUnits("100", 6),
        deployer.account.address
      ]);
      
      let hash = await genesisMecha.write.grantRole([MINTER_ROLE, blindBox.address]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await gemToken.write.mint([deployer.account.address, parseUnits("10000", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 进行一些购买以产生收益
      hash = await gemToken.write.transfer([user1.account.address, parseUnits("1000", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await gemToken.write.approve([blindBox.address, parseUnits("500", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await blindBox.write.purchaseBlindBox([3n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
    });

    it("应该支持完整的价格管理流程", async () => {
      const oldPrice = await blindBox.read.mintPrice();
      const newPrice = parseUnits("150", 6);
      
      // 更改价格
      let hash = await blindBox.write.setMintPrice([newPrice]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const currentPrice = await blindBox.read.mintPrice();
      assert.equal(currentPrice.toString(), newPrice.toString());
      
      // 验证新价格生效
      hash = await gemToken.write.approve([blindBox.address, newPrice], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const initialBalance = await gemToken.read.balanceOf([user1.account.address]);
      
      hash = await blindBox.write.purchaseBlindBox([1n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const finalBalance = await gemToken.read.balanceOf([user1.account.address]);
      assert.equal(finalBalance.toString(), (initialBalance - newPrice).toString());
    });

    it("应该支持完整的收益管理流程", async () => {
      const initialContractBalance = await gemToken.read.balanceOf([blindBox.address]);
      const initialDeployerBalance = await gemToken.read.balanceOf([deployer.account.address]);
      
      // 提取部分收益
      const withdrawAmount = parseUnits("200", 6);
      let hash = await blindBox.write.withdrawRevenue([deployer.account.address, withdrawAmount]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      let contractBalance = await gemToken.read.balanceOf([blindBox.address]);
      let deployerBalance = await gemToken.read.balanceOf([deployer.account.address]);
      
      assert.equal(contractBalance.toString(), (initialContractBalance - withdrawAmount).toString());
      assert.equal(deployerBalance.toString(), (initialDeployerBalance + withdrawAmount).toString());
      
      // 提取剩余收益
      hash = await blindBox.write.withdrawRevenue([deployer.account.address, 0n]); // 0表示全部
      await publicClient.waitForTransactionReceipt({ hash });
      
      contractBalance = await gemToken.read.balanceOf([blindBox.address]);
      deployerBalance = await gemToken.read.balanceOf([deployer.account.address]);
      
      assert.equal(contractBalance.toString(), "0");
      assert.equal(deployerBalance.toString(), (initialDeployerBalance + initialContractBalance).toString());
    });

    it("应该支持暂停和恢复功能", async () => {
      // 暂停合约
      let hash = await blindBox.write.pause();
      await publicClient.waitForTransactionReceipt({ hash });
      
      let isPaused = await blindBox.read.paused();
      assert.equal(isPaused, true);
      
      // 暂停时无法购买
      try {
        await blindBox.write.purchaseBlindBox([1n], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("EnforcedPause") || error.message.includes("paused"));
      }
      
      // 恢复合约
      hash = await blindBox.write.unpause();
      await publicClient.waitForTransactionReceipt({ hash });
      
      isPaused = await blindBox.read.paused();
      assert.equal(isPaused, false);
      
      // 恢复后可以购买
      hash = await blindBox.write.purchaseBlindBox([1n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const nftBalance = await genesisMecha.read.balanceOf([user1.account.address]);
      assert.equal(nftBalance.toString(), "4"); // 之前3个 + 新购买1个
    });
  });
});
