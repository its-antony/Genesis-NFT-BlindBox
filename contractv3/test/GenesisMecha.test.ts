import { describe, it, beforeEach } from "node:test";
import { strict as assert } from "node:assert";
import { network } from "hardhat";
import { getAddress } from "viem";

/**
 * GenesisMecha 合约测试
 * 
 * 测试覆盖：
 * 1. 基本 ERC721 功能
 * 2. 角色权限控制
 * 3. 铸造功能
 * 4. 元数据管理
 * 5. 供应量限制
 */

describe("GenesisMecha", () => {
  let genesisMecha: any;
  let admin: any;
  let minter: any;
  let user1: any;
  let user2: any;
  let publicClient: any;
  let MINTER_ROLE: string;
  let DEFAULT_ADMIN_ROLE: string;

  beforeEach(async () => {
    const { viem } = await network.connect();
    
    // 获取测试账户
    const walletClients = await viem.getWalletClients();
    [admin, minter, user1, user2] = walletClients;
    
    publicClient = await viem.getPublicClient();
    
    // 部署 GenesisMecha 合约
    genesisMecha = await viem.deployContract("GenesisMecha", [
      admin.account.address,
      minter.account.address
    ]);
    
    // 获取角色常量
    MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  });

  describe("部署和初始化", () => {
    it("应该正确设置 NFT 基本信息", async () => {
      const name = await genesisMecha.read.name();
      const symbol = await genesisMecha.read.symbol();
      const maxSupply = await genesisMecha.read.MAX_SUPPLY();
      
      assert.equal(name, "Genesis Mecha");
      assert.equal(symbol, "GMECHA");
      assert.equal(maxSupply.toString(), "20");
    });

    it("应该正确设置角色权限", async () => {
      const hasAdminRole = await genesisMecha.read.hasRole([DEFAULT_ADMIN_ROLE, admin.account.address]);
      const hasMinterRole = await genesisMecha.read.hasRole([MINTER_ROLE, minter.account.address]);
      
      assert.equal(hasAdminRole, true);
      assert.equal(hasMinterRole, true);
    });

    it("应该初始化为零供应量", async () => {
      const totalSupply = await genesisMecha.read.totalSupply();
      const remainingSupply = await genesisMecha.read.remainingSupply();
      const isSoldOut = await genesisMecha.read.isSoldOut();
      
      assert.equal(totalSupply.toString(), "0");
      assert.equal(remainingSupply.toString(), "20");
      assert.equal(isSoldOut, false);
    });
  });

  describe("角色权限管理", () => {
    it("管理员应该能够授予和撤销角色", async () => {
      // 授予 user1 MINTER_ROLE
      let hash = await genesisMecha.write.grantRole([MINTER_ROLE, user1.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      let hasMinterRole = await genesisMecha.read.hasRole([MINTER_ROLE, user1.account.address]);
      assert.equal(hasMinterRole, true);
      
      // 撤销 user1 的 MINTER_ROLE
      hash = await genesisMecha.write.revokeRole([MINTER_ROLE, user1.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      hasMinterRole = await genesisMecha.read.hasRole([MINTER_ROLE, user1.account.address]);
      assert.equal(hasMinterRole, false);
    });

    it("非管理员不应该能够管理角色", async () => {
      try {
        await genesisMecha.write.grantRole([MINTER_ROLE, user2.account.address], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("AccessControlUnauthorizedAccount") || error.message.includes("AccessControl"));
      }
    });
  });

  describe("NFT 铸造功能", () => {
    it("具有 MINTER_ROLE 的账户应该能够铸造 NFT", async () => {
      const hash = await genesisMecha.write.safeMint([user1.account.address], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const balance = await genesisMecha.read.balanceOf([user1.account.address]);
      const owner = await genesisMecha.read.ownerOf([1n]);
      const totalSupply = await genesisMecha.read.totalSupply();
      
      assert.equal(balance.toString(), "1");
      assert.equal(getAddress(owner), getAddress(user1.account.address));
      assert.equal(totalSupply.toString(), "1");
    });

    it("非 MINTER_ROLE 账户不应该能够铸造 NFT", async () => {
      try {
        await genesisMecha.write.safeMint([user1.account.address], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("AccessControlUnauthorizedAccount") || error.message.includes("AccessControl"));
      }
    });

    it("应该能够批量铸造 NFT", async () => {
      const amount = 3;
      const hash = await genesisMecha.write.safeMintBatch([user1.account.address, amount], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const balance = await genesisMecha.read.balanceOf([user1.account.address]);
      const totalSupply = await genesisMecha.read.totalSupply();
      
      assert.equal(balance.toString(), amount.toString());
      assert.equal(totalSupply.toString(), amount.toString());
      
      // 验证每个 NFT 的拥有者
      for (let i = 1; i <= amount; i++) {
        const owner = await genesisMecha.read.ownerOf([BigInt(i)]);
        assert.equal(getAddress(owner), getAddress(user1.account.address));
      }
    });

    it("应该拒绝超过最大供应量的铸造", async () => {
      // 先铸造到接近最大供应量
      const hash1 = await genesisMecha.write.safeMintBatch([user1.account.address, 18], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash1 });
      
      // 再铸造2个应该成功
      const hash2 = await genesisMecha.write.safeMintBatch([user1.account.address, 2], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash2 });
      
      // 尝试再铸造1个应该失败
      try {
        await genesisMecha.write.safeMint([user1.account.address], {
          account: minter.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Max supply exceeded"));
      }
    });

    it("应该拒绝无效的批量铸造数量", async () => {
      // 测试数量为0
      try {
        await genesisMecha.write.safeMintBatch([user1.account.address, 0], {
          account: minter.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Invalid amount"));
      }
      
      // 测试数量超过10
      try {
        await genesisMecha.write.safeMintBatch([user1.account.address, 11], {
          account: minter.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Invalid amount"));
      }
    });
  });

  describe("元数据管理", () => {
    beforeEach(async () => {
      // 铸造一些 NFT 用于测试
      const hash = await genesisMecha.write.safeMintBatch([user1.account.address, 3], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
    });

    it("管理员应该能够设置 Base URI", async () => {
      const newBaseURI = "https://example.com/metadata/";
      
      const hash = await genesisMecha.write.setBaseURI([newBaseURI]);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const baseURI = await genesisMecha.read.getBaseURI();
      assert.equal(baseURI, newBaseURI);
    });

    it("非管理员不应该能够设置 Base URI", async () => {
      const newBaseURI = "https://example.com/metadata/";
      
      try {
        await genesisMecha.write.setBaseURI([newBaseURI], {
          account: user1.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("AccessControlUnauthorizedAccount") || error.message.includes("AccessControl"));
      }
    });

    it("MINTER_ROLE 应该能够设置 Token 元数据", async () => {
      const tokenId = 1n;
      const metadataIndex = 5;
      
      const hash = await genesisMecha.write.setTokenMetadata([tokenId, metadataIndex], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const tokenURI = await genesisMecha.read.tokenURI([tokenId]);
      assert.ok(tokenURI.includes("5.json"));
    });

    it("应该能够批量设置 Token 元数据", async () => {
      const tokenIds = [1n, 2n, 3n];
      const metadataIndices = [5, 10, 15];
      
      const hash = await genesisMecha.write.setTokenMetadataBatch([tokenIds, metadataIndices], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      for (let i = 0; i < tokenIds.length; i++) {
        const tokenURI = await genesisMecha.read.tokenURI([tokenIds[i]]);
        assert.ok(tokenURI.includes(`${metadataIndices[i]}.json`));
      }
    });

    it("应该拒绝为不存在的 Token 设置元数据", async () => {
      const tokenId = 999n; // 不存在的 Token
      const metadataIndex = 5;
      
      try {
        await genesisMecha.write.setTokenMetadata([tokenId, metadataIndex], {
          account: minter.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Token does not exist"));
      }
    });

    it("应该拒绝无效的元数据索引", async () => {
      const tokenId = 1n;
      const invalidIndex = 25; // 超过最大供应量
      
      try {
        await genesisMecha.write.setTokenMetadata([tokenId, invalidIndex], {
          account: minter.account
        });
        assert.fail("应该抛出错误");
      } catch (error: any) {
        assert.ok(error.message.includes("Invalid metadata index"));
      }
    });
  });

  describe("ERC721 基本功能", () => {
    beforeEach(async () => {
      // 铸造一些 NFT 用于测试
      const hash = await genesisMecha.write.safeMintBatch([user1.account.address, 2], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
    });

    it("应该能够转移 NFT", async () => {
      const tokenId = 1n;
      
      const hash = await genesisMecha.write.transferFrom([user1.account.address, user2.account.address, tokenId], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const newOwner = await genesisMecha.read.ownerOf([tokenId]);
      const user1Balance = await genesisMecha.read.balanceOf([user1.account.address]);
      const user2Balance = await genesisMecha.read.balanceOf([user2.account.address]);
      
      assert.equal(getAddress(newOwner), getAddress(user2.account.address));
      assert.equal(user1Balance.toString(), "1");
      assert.equal(user2Balance.toString(), "1");
    });

    it("应该能够授权和转移 NFT", async () => {
      const tokenId = 1n;
      
      // user1 授权 user2
      let hash = await genesisMecha.write.approve([user2.account.address, tokenId], {
        account: user1.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const approved = await genesisMecha.read.getApproved([tokenId]);
      assert.equal(getAddress(approved), getAddress(user2.account.address));
      
      // user2 转移 NFT
      hash = await genesisMecha.write.transferFrom([user1.account.address, user2.account.address, tokenId], {
        account: user2.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const newOwner = await genesisMecha.read.ownerOf([tokenId]);
      assert.equal(getAddress(newOwner), getAddress(user2.account.address));
    });
  });

  describe("供应量管理", () => {
    it("应该正确跟踪供应量状态", async () => {
      // 初始状态
      let totalSupply = await genesisMecha.read.totalSupply();
      let remainingSupply = await genesisMecha.read.remainingSupply();
      let isSoldOut = await genesisMecha.read.isSoldOut();
      
      assert.equal(totalSupply.toString(), "0");
      assert.equal(remainingSupply.toString(), "20");
      assert.equal(isSoldOut, false);
      
      // 铸造一些 NFT
      const hash = await genesisMecha.write.safeMintBatch([user1.account.address, 10], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      totalSupply = await genesisMecha.read.totalSupply();
      remainingSupply = await genesisMecha.read.remainingSupply();
      isSoldOut = await genesisMecha.read.isSoldOut();
      
      assert.equal(totalSupply.toString(), "10");
      assert.equal(remainingSupply.toString(), "10");
      assert.equal(isSoldOut, false);
    });

    it("应该正确检测售罄状态", async () => {
      // 铸造到最大供应量
      const hash = await genesisMecha.write.safeMintBatch([user1.account.address, 20], {
        account: minter.account
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const totalSupply = await genesisMecha.read.totalSupply();
      const remainingSupply = await genesisMecha.read.remainingSupply();
      const isSoldOut = await genesisMecha.read.isSoldOut();
      
      assert.equal(totalSupply.toString(), "20");
      assert.equal(remainingSupply.toString(), "0");
      assert.equal(isSoldOut, true);
    });
  });
});
