import { describe, it, beforeEach } from "node:test";
import { strict as assert } from "node:assert";
import { network } from "hardhat";
import { formatUnits, parseUnits, getAddress } from "viem";

/**
 * GemToken 合约测试
 * 
 * 测试覆盖：
 * 1. 基本 ERC20 功能
 * 2. 铸造和销毁功能
 * 3. 权限控制
 * 4. 边界条件测试
 */

describe("GemToken", () => {
  let gemToken: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let publicClient: any;

  beforeEach(async () => {
    const { viem } = await network.connect();
    
    // 获取测试账户
    const walletClients = await viem.getWalletClients();
    [owner, user1, user2] = walletClients;
    
    publicClient = await viem.getPublicClient();
    
    // 部署 GemToken 合约
    gemToken = await viem.deployContract("GemToken", [owner.account.address]);
  });

  describe("部署和初始化", () => {
    it("应该正确设置代币基本信息", async () => {
      const name = await gemToken.read.name();
      const symbol = await gemToken.read.symbol();
      const decimals = await gemToken.read.decimals();
      const totalSupply = await gemToken.read.totalSupply();
      
      assert.equal(name, "Gem Token");
      assert.equal(symbol, "GEM");
      assert.equal(decimals, 6);
      assert.equal(totalSupply.toString(), parseUnits("10000000", 6).toString());
    });

    it("应该将所有初始代币分配给部署者", async () => {
      const ownerBalance = await gemToken.read.balanceOf([owner.account.address]);
      const expectedBalance = parseUnits("10000000", 6);
      
      assert.equal(ownerBalance.toString(), expectedBalance.toString());
    });

    it("应该正确设置合约拥有者", async () => {
      const contractOwner = await gemToken.read.owner();
      assert.equal(getAddress(contractOwner), getAddress(owner.account.address));
    });
  });

  describe("ERC20 基本功能", () => {
    it("应该能够转账代币", async () => {
      const transferAmount = parseUnits("1000", 6);
      
      // 执行转账
      const hash = await gemToken.write.transfer([user1.account.address, transferAmount]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 验证余额
      const user1Balance = await gemToken.read.balanceOf([user1.account.address]);
      assert.equal(user1Balance.toString(), transferAmount.toString());
      
      const ownerBalance = await gemToken.read.balanceOf([owner.account.address]);
      const expectedOwnerBalance = parseUnits("10000000", 6) - transferAmount;
      assert.equal(ownerBalance.toString(), expectedOwnerBalance.toString());
    });

    it("应该能够授权和转账", async () => {
      const approveAmount = parseUnits("500", 6);
      const transferAmount = parseUnits("300", 6);
      
      // owner 授权给 user1
      let hash = await gemToken.write.approve([user1.account.address, approveAmount]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 检查授权额度
      const allowance = await gemToken.read.allowance([owner.account.address, user1.account.address]);
      assert.equal(allowance.toString(), approveAmount.toString());
      
      // user1 代表 owner 转账给 user2
      hash = await gemToken.write.transferFrom([owner.account.address, user2.account.address, transferAmount], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 验证余额
      const user2Balance = await gemToken.read.balanceOf([user2.account.address]);
      assert.equal(user2Balance.toString(), transferAmount.toString());
      
      // 验证剩余授权额度
      const remainingAllowance = await gemToken.read.allowance([owner.account.address, user1.account.address]);
      assert.equal(remainingAllowance.toString(), (approveAmount - transferAmount).toString());
    });

    it("应该拒绝余额不足的转账", async () => {
      const transferAmount = parseUnits("20000000", 6); // 超过总供应量
      
      try {
        await gemToken.write.transfer([user1.account.address, transferAmount]);
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("ERC20InsufficientBalance") || error.message.includes("insufficient"));
      }
    });

    it("应该拒绝授权额度不足的转账", async () => {
      const approveAmount = parseUnits("100", 6);
      const transferAmount = parseUnits("200", 6);
      
      // 授权
      let hash = await gemToken.write.approve([user1.account.address, approveAmount]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 尝试超额转账
      try {
        await gemToken.write.transferFrom([owner.account.address, user2.account.address, transferAmount], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("ERC20InsufficientAllowance") || error.message.includes("allowance"));
      }
    });
  });

  describe("铸造功能", () => {
    it("合约拥有者应该能够铸造代币", async () => {
      const mintAmount = parseUnits("5000", 6);
      const initialSupply = await gemToken.read.totalSupply();
      
      // 铸造代币
      const hash = await gemToken.write.mint([user1.account.address, mintAmount]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 验证余额和总供应量
      const user1Balance = await gemToken.read.balanceOf([user1.account.address]);
      const newTotalSupply = await gemToken.read.totalSupply();
      
      assert.equal(user1Balance.toString(), mintAmount.toString());
      assert.equal(newTotalSupply.toString(), (initialSupply + mintAmount).toString());
    });

    it("非拥有者不应该能够铸造代币", async () => {
      const mintAmount = parseUnits("1000", 6);
      
      try {
        await gemToken.write.mint([user2.account.address, mintAmount], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("OwnableUnauthorizedAccount") || error.message.includes("Ownable"));
      }
    });
  });

  describe("销毁功能", () => {
    beforeEach(async () => {
      // 给 user1 一些代币用于测试
      const transferAmount = parseUnits("1000", 6);
      const hash = await gemToken.write.transfer([user1.account.address, transferAmount]);
      await publicClient.waitForTransactionReceipt({ hash });
    });

    it("合约拥有者应该能够销毁代币", async () => {
      const burnAmount = parseUnits("500", 6);
      const initialBalance = await gemToken.read.balanceOf([user1.account.address]);
      const initialSupply = await gemToken.read.totalSupply();
      
      // 销毁代币
      const hash = await gemToken.write.burn([user1.account.address, burnAmount]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 验证余额和总供应量
      const newBalance = await gemToken.read.balanceOf([user1.account.address]);
      const newTotalSupply = await gemToken.read.totalSupply();
      
      assert.equal(newBalance.toString(), (initialBalance - burnAmount).toString());
      assert.equal(newTotalSupply.toString(), (initialSupply - burnAmount).toString());
    });

    it("非拥有者不应该能够销毁代币", async () => {
      const burnAmount = parseUnits("100", 6);
      
      try {
        await gemToken.write.burn([user1.account.address, burnAmount], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("OwnableUnauthorizedAccount") || error.message.includes("Ownable"));
      }
    });

    it("应该拒绝销毁超过余额的代币", async () => {
      const burnAmount = parseUnits("2000", 6); // 超过用户余额
      
      try {
        await gemToken.write.burn([user1.account.address, burnAmount]);
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("ERC20InsufficientBalance") || error.message.includes("insufficient"));
      }
    });
  });

  describe("工具函数", () => {
    it("应该正确返回代币信息", async () => {
      const tokenInfo = await gemToken.read.getTokenInfo();
      
      assert.equal(tokenInfo[0], "Gem Token"); // tokenName
      assert.equal(tokenInfo[1], "GEM");       // tokenSymbol
      assert.equal(tokenInfo[2], 6);           // tokenDecimals
      assert.equal(tokenInfo[3].toString(), parseUnits("10000000", 6).toString()); // tokenTotalSupply
    });
  });

  describe("边界条件测试", () => {
    it("应该能够处理零值转账", async () => {
      const hash = await gemToken.write.transfer([user1.account.address, 0n]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const user1Balance = await gemToken.read.balanceOf([user1.account.address]);
      assert.equal(user1Balance.toString(), "0");
    });

    it("应该能够处理零值授权", async () => {
      const hash = await gemToken.write.approve([user1.account.address, 0n]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const allowance = await gemToken.read.allowance([owner.account.address, user1.account.address]);
      assert.equal(allowance.toString(), "0");
    });

    it("应该能够重置授权额度", async () => {
      // 先授权
      let hash = await gemToken.write.approve([user1.account.address, parseUnits("100", 6)]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 重置为0
      hash = await gemToken.write.approve([user1.account.address, 0n]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const allowance = await gemToken.read.allowance([owner.account.address, user1.account.address]);
      assert.equal(allowance.toString(), "0");
    });
  });
});
