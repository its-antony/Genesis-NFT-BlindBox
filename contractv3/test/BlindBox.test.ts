import { describe, it, beforeEach } from "node:test";
import { strict as assert } from "node:assert";
import { network } from "hardhat";
import { formatUnits, parseUnits, getAddress } from "viem";

/**
 * BlindBox 合约测试
 * 
 * 测试覆盖：
 * 1. 合约初始化和配置
 * 2. 盲盒购买流程
 * 3. 价格管理
 * 4. 权限控制
 * 5. 收益管理
 * 6. 暂停功能
 * 7. 随机性和元数据分配
 */

describe("BlindBox", () => {
  let gemToken: any;
  let genesisMecha: any;
  let blindBox: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let publicClient: any;
  let MINTER_ROLE: string;
  let initialMintPrice: bigint;

  beforeEach(async () => {
    const { viem } = await network.connect();
    
    // 获取测试账户
    const walletClients = await viem.getWalletClients();
    [owner, user1, user2] = walletClients;
    
    publicClient = await viem.getPublicClient();
    
    // 部署合约
    gemToken = await viem.deployContract("GemToken", [owner.account.address]);
    genesisMecha = await viem.deployContract("GenesisMecha", [owner.account.address, owner.account.address]);
    
    initialMintPrice = parseUnits("100", 6); // 100 GEM
    blindBox = await viem.deployContract("BlindBox", [
      gemToken.address,
      genesisMecha.address,
      initialMintPrice,
      owner.account.address
    ]);
    
    // 设置权限
    MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    let hash = await genesisMecha.write.grantRole([MINTER_ROLE, blindBox.address]);
    await publicClient.waitForTransactionReceipt({ hash });
    
    // 为测试账户准备一些 GEM 代币
    hash = await gemToken.write.mint([owner.account.address, parseUnits("10000", 6)]);
    await publicClient.waitForTransactionReceipt({ hash });
    
    hash = await gemToken.write.transfer([user1.account.address, parseUnits("5000", 6)]);
    await publicClient.waitForTransactionReceipt({ hash });
    
    hash = await gemToken.write.transfer([user2.account.address, parseUnits("3000", 6)]);
    await publicClient.waitForTransactionReceipt({ hash });
  });

  describe("合约初始化", () => {
    it("应该正确设置合约参数", async () => {
      const mintPrice = await blindBox.read.mintPrice();
      const contractOwner = await blindBox.read.owner();
      const gemTokenAddress = await blindBox.read.gemToken();
      const genesisMechaAddress = await blindBox.read.genesisMecha();
      
      assert.equal(mintPrice.toString(), initialMintPrice.toString());
      assert.equal(getAddress(contractOwner), getAddress(owner.account.address));
      assert.equal(getAddress(gemTokenAddress), getAddress(gemToken.address));
      assert.equal(getAddress(genesisMechaAddress), getAddress(genesisMecha.address));
    });

    it("应该正确初始化统计数据", async () => {
      const totalMinted = await blindBox.read.totalMinted();
      const totalRevenue = await blindBox.read.totalRevenue();
      const remainingIndices = await blindBox.read.getRemainingIndices();
      
      assert.equal(totalMinted.toString(), "0");
      assert.equal(totalRevenue.toString(), "0");
      assert.equal(remainingIndices.toString(), "20");
    });

    it("应该拒绝无效的构造参数", async () => {
      const { viem } = await network.connect();
      
      try {
        await viem.deployContract("BlindBox", [
          "0x0000000000000000000000000000000000000000", // 无效的 gem token 地址
          genesisMecha.address,
          initialMintPrice,
          owner.account.address
        ]);
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Invalid gem token address"));
      }
    });
  });

  describe("盲盒购买功能", () => {
    beforeEach(async () => {
      // 用户授权 BlindBox 合约
      const hash = await gemToken.write.approve([blindBox.address, parseUnits("2000", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
    });

    it("应该能够购买单个盲盒", async () => {
      const initialBalance = await gemToken.read.balanceOf([user1.account.address]);
      const initialNftBalance = await genesisMecha.read.balanceOf([user1.account.address]);
      
      const hash = await blindBox.write.purchaseBlindBox([1n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const newBalance = await gemToken.read.balanceOf([user1.account.address]);
      const newNftBalance = await genesisMecha.read.balanceOf([user1.account.address]);
      const totalMinted = await blindBox.read.totalMinted();
      const totalRevenue = await blindBox.read.totalRevenue();
      
      assert.equal(newBalance.toString(), (initialBalance - initialMintPrice).toString());
      assert.equal(newNftBalance.toString(), (initialNftBalance + 1n).toString());
      assert.equal(totalMinted.toString(), "1");
      assert.equal(totalRevenue.toString(), initialMintPrice.toString());
    });

    it("应该能够批量购买盲盒", async () => {
      const purchaseCount = 3n;
      const totalCost = initialMintPrice * purchaseCount;
      
      const initialBalance = await gemToken.read.balanceOf([user1.account.address]);
      const initialNftBalance = await genesisMecha.read.balanceOf([user1.account.address]);
      
      const hash = await blindBox.write.purchaseBlindBox([purchaseCount], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const newBalance = await gemToken.read.balanceOf([user1.account.address]);
      const newNftBalance = await genesisMecha.read.balanceOf([user1.account.address]);
      const totalMinted = await blindBox.read.totalMinted();
      
      assert.equal(newBalance.toString(), (initialBalance - totalCost).toString());
      assert.equal(newNftBalance.toString(), (initialNftBalance + purchaseCount).toString());
      assert.equal(totalMinted.toString(), purchaseCount.toString());
    });

    it("应该正确分配随机元数据", async () => {
      // 购买多个盲盒
      const hash = await blindBox.write.purchaseBlindBox([5n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const totalSupply = await genesisMecha.read.totalSupply();
      const usedIndices = new Set();
      
      // 检查每个 NFT 的元数据
      for (let i = 1; i <= Number(totalSupply); i++) {
        const tokenURI = await genesisMecha.read.tokenURI([BigInt(i)]);
        const match = tokenURI.match(/(\d+)\.json$/);
        
        assert.ok(match, "Token URI 应该包含数字索引");
        
        const index = parseInt(match[1]);
        assert.ok(index >= 1 && index <= 20, "元数据索引应该在有效范围内");
        assert.ok(!usedIndices.has(index), "元数据索引不应该重复");
        
        usedIndices.add(index);
      }
    });

    it("应该拒绝无效的购买数量", async () => {
      // 测试数量为0
      try {
        await blindBox.write.purchaseBlindBox([0n], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Invalid amount"));
      }
      
      // 测试数量超过最大限制
      try {
        await blindBox.write.purchaseBlindBox([11n], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Invalid amount"));
      }
    });

    it("应该拒绝余额不足的购买", async () => {
      // 用户2的余额不足购买30个盲盒
      const hash = await gemToken.write.approve([blindBox.address, parseUnits("5000", 6)], {
        account: user2.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      try {
        await blindBox.write.purchaseBlindBox([30n], {
          account: user2.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Insufficient GEM balance") || error.message.includes("Not enough NFTs remaining"));
      }
    });

    it("应该拒绝授权不足的购买", async () => {
      // 重新设置较小的授权额度
      let hash = await gemToken.write.approve([blindBox.address, 0n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await gemToken.write.approve([blindBox.address, parseUnits("50", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      try {
        await blindBox.write.purchaseBlindBox([2n], { // 需要200 GEM，但只授权了50 GEM
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Insufficient GEM allowance"));
      }
    });

    it("应该拒绝超过剩余供应量的购买", async () => {
      // 先购买大部分 NFT
      let hash = await gemToken.write.approve([blindBox.address, parseUnits("5000", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await blindBox.write.purchaseBlindBox([18n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 尝试购买超过剩余数量的 NFT
      try {
        await blindBox.write.purchaseBlindBox([5n], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Not enough NFTs remaining"));
      }
    });
  });

  describe("价格管理", () => {
    it("合约拥有者应该能够设置新价格", async () => {
      const newPrice = parseUnits("150", 6);
      
      const hash = await blindBox.write.setMintPrice([newPrice]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const mintPrice = await blindBox.read.mintPrice();
      assert.equal(mintPrice.toString(), newPrice.toString());
    });

    it("非拥有者不应该能够设置价格", async () => {
      const newPrice = parseUnits("150", 6);
      
      try {
        await blindBox.write.setMintPrice([newPrice], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("OwnableUnauthorizedAccount") || error.message.includes("Ownable"));
      }
    });

    it("应该拒绝设置无效价格", async () => {
      try {
        await blindBox.write.setMintPrice([0n]);
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Invalid price"));
      }
    });

    it("价格变更应该影响后续购买", async () => {
      const newPrice = parseUnits("200", 6);
      
      // 设置新价格
      let hash = await blindBox.write.setMintPrice([newPrice]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 用户授权新价格
      hash = await gemToken.write.approve([blindBox.address, newPrice], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const initialBalance = await gemToken.read.balanceOf([user1.account.address]);
      
      // 购买盲盒
      hash = await blindBox.write.purchaseBlindBox([1n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const newBalance = await gemToken.read.balanceOf([user1.account.address]);
      assert.equal(newBalance.toString(), (initialBalance - newPrice).toString());
    });
  });

  describe("收益管理", () => {
    beforeEach(async () => {
      // 先进行一些购买以产生收益
      let hash = await gemToken.write.approve([blindBox.address, parseUnits("1000", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await blindBox.write.purchaseBlindBox([5n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
    });

    it("合约拥有者应该能够提取收益", async () => {
      const contractBalance = await gemToken.read.balanceOf([blindBox.address]);
      const initialOwnerBalance = await gemToken.read.balanceOf([owner.account.address]);
      
      const hash = await blindBox.write.withdrawRevenue([owner.account.address, 0n]); // 0表示提取全部
      await publicClient.waitForTransactionReceipt({ hash });
      
      const newOwnerBalance = await gemToken.read.balanceOf([owner.account.address]);
      const newContractBalance = await gemToken.read.balanceOf([blindBox.address]);
      
      assert.equal(newOwnerBalance.toString(), (initialOwnerBalance + contractBalance).toString());
      assert.equal(newContractBalance.toString(), "0");
    });

    it("应该能够提取指定数量的收益", async () => {
      const withdrawAmount = parseUnits("200", 6);
      const initialOwnerBalance = await gemToken.read.balanceOf([owner.account.address]);
      const initialContractBalance = await gemToken.read.balanceOf([blindBox.address]);
      
      const hash = await blindBox.write.withdrawRevenue([owner.account.address, withdrawAmount]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const newOwnerBalance = await gemToken.read.balanceOf([owner.account.address]);
      const newContractBalance = await gemToken.read.balanceOf([blindBox.address]);
      
      assert.equal(newOwnerBalance.toString(), (initialOwnerBalance + withdrawAmount).toString());
      assert.equal(newContractBalance.toString(), (initialContractBalance - withdrawAmount).toString());
    });

    it("非拥有者不应该能够提取收益", async () => {
      try {
        await blindBox.write.withdrawRevenue([user1.account.address, 0n], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("OwnableUnauthorizedAccount") || error.message.includes("Ownable"));
      }
    });

    it("应该拒绝提取超过余额的收益", async () => {
      const excessiveAmount = parseUnits("10000", 6);
      
      try {
        await blindBox.write.withdrawRevenue([owner.account.address, excessiveAmount]);
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Insufficient balance"));
      }
    });
  });

  describe("暂停功能", () => {
    it("合约拥有者应该能够暂停和恢复合约", async () => {
      // 暂停合约
      let hash = await blindBox.write.pause();
      await publicClient.waitForTransactionReceipt({ hash });
      
      let isPaused = await blindBox.read.paused();
      assert.equal(isPaused, true);
      
      // 恢复合约
      hash = await blindBox.write.unpause();
      await publicClient.waitForTransactionReceipt({ hash });
      
      isPaused = await blindBox.read.paused();
      assert.equal(isPaused, false);
    });

    it("暂停时应该拒绝购买盲盒", async () => {
      // 暂停合约
      let hash = await blindBox.write.pause();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 用户授权
      hash = await gemToken.write.approve([blindBox.address, parseUnits("200", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 尝试购买盲盒
      try {
        await blindBox.write.purchaseBlindBox([1n], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("EnforcedPause") || error.message.includes("paused"));
      }
    });

    it("非拥有者不应该能够暂停合约", async () => {
      try {
        await blindBox.write.pause({
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("OwnableUnauthorizedAccount") || error.message.includes("Ownable"));
      }
    });
  });

  describe("信息查询功能", () => {
    beforeEach(async () => {
      // 进行一些购买
      let hash = await gemToken.write.approve([blindBox.address, parseUnits("500", 6)], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });

      hash = await blindBox.write.purchaseBlindBox([3n], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
    });

    it("应该正确返回合约信息", async () => {
      const contractInfo = await blindBox.read.getContractInfo();

      assert.equal(contractInfo[0].toString(), initialMintPrice.toString()); // currentPrice
      assert.equal(contractInfo[1].toString(), "20"); // totalSupply
      assert.equal(contractInfo[2].toString(), "17"); // remainingSupply
      assert.equal(contractInfo[3].toString(), "3");  // minted
      assert.equal(contractInfo[4].toString(), (initialMintPrice * 3n).toString()); // revenue
      assert.equal(contractInfo[5], false); // soldOut
      assert.equal(contractInfo[6], false); // paused
    });

    it("应该正确返回用户信息", async () => {
      const userInfo = await blindBox.read.getUserInfo([user1.account.address]);

      assert.ok(userInfo[0] > 0n); // gemBalance
      assert.ok(userInfo[1] >= 0n); // gemAllowance
      assert.equal(userInfo[2].toString(), "3"); // nftBalance
      assert.equal(userInfo[3].toString(), "3"); // mintedCount
    });

    it("应该正确跟踪用户铸造记录", async () => {
      const user1MintCount = await blindBox.read.userMintCount([user1.account.address]);
      const user2MintCount = await blindBox.read.userMintCount([user2.account.address]);

      assert.equal(user1MintCount.toString(), "3");
      assert.equal(user2MintCount.toString(), "0");
    });

    it("应该正确检测元数据索引使用状态", async () => {
      // 检查一些索引的使用状态
      let usedCount = 0;
      for (let i = 1; i <= 20; i++) {
        const isUsed = await blindBox.read.isMetadataIndexUsed([i]);
        if (isUsed) usedCount++;
      }

      assert.equal(usedCount, 3); // 应该有3个索引被使用

      const remainingIndices = await blindBox.read.getRemainingIndices();
      assert.equal(remainingIndices.toString(), "17");
    });
  });
});
