// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./GemToken.sol";
import "./GenesisMecha.sol";

/**
 * @title BlindBox
 * @dev 盲盒核心合约，处理GEM代币支付和NFT铸造
 * 
 * 功能特性：
 * - 用户支付GEM代币铸造随机NFT
 * - 支持单个和批量铸造
 * - 价格管理和库存控制
 * - 防重入攻击保护
 * - 紧急暂停功能
 * - 收益提取功能
 */
contract BlindBox is Ownable, ReentrancyGuard, Pausable {
    
    // 合约引用
    GemToken public immutable gemToken;
    GenesisMecha public immutable genesisMecha;

    // 铸造价格 (GEM代币数量，考虑6位小数)
    uint256 public mintPrice;

    // 单次最大铸造数量
    uint256 public constant MAX_MINT_PER_TX = 10;
    uint256 public constant MAX_SUPPLY = 20; // 最大供应量

    // 统计数据
    uint256 public totalMinted;
    uint256 public totalRevenue;

    // 用户铸造记录
    mapping(address => uint256) public userMintCount;

    // 盲盒逻辑相关
    mapping(uint256 => bool) private _usedMetadataIndices;
    uint256 private _remainingIndices;
    
    // 事件
    event Minted(
        address indexed user, 
        uint256 indexed tokenId, 
        uint256 price,
        uint256 timestamp
    );
    
    event BatchMinted(
        address indexed user,
        uint256[] tokenIds,
        uint256 totalPrice,
        uint256 timestamp
    );
    
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event RevenueWithdrawn(address indexed to, uint256 amount);
    
    /**
     * @dev 构造函数
     * @param _gemToken GEM代币合约地址
     * @param _genesisMecha 创世纪机甲NFT合约地址
     * @param _mintPrice 初始铸造价格 (GEM代币数量)
     * @param _owner 合约拥有者地址
     */
    constructor(
        address _gemToken,
        address _genesisMecha,
        uint256 _mintPrice,
        address _owner
    ) Ownable(_owner) {
        require(_gemToken != address(0), "BlindBox: Invalid gem token address");
        require(_genesisMecha != address(0), "BlindBox: Invalid mecha address");
        require(_mintPrice > 0, "BlindBox: Invalid mint price");
        
        gemToken = GemToken(_gemToken);
        genesisMecha = GenesisMecha(_genesisMecha);
        mintPrice = _mintPrice;

        // 初始化盲盒逻辑
        _remainingIndices = MAX_SUPPLY;
    }
    
    /**
     * @dev 购买盲盒 (支持批量)
     * @param amount 购买数量
     */
    function purchaseBlindBox(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0 && amount <= MAX_MINT_PER_TX, "BlindBox: Invalid amount");
        require(_remainingIndices >= amount, "BlindBox: Not enough NFTs remaining");
        
        uint256 totalCost = mintPrice * amount;
        
        // 检查用户GEM代币余额
        require(
            gemToken.balanceOf(msg.sender) >= totalCost,
            "BlindBox: Insufficient GEM balance"
        );
        
        // 检查用户是否已授权足够的代币
        require(
            gemToken.allowance(msg.sender, address(this)) >= totalCost,
            "BlindBox: Insufficient GEM allowance"
        );
        
        // 转移GEM代币到本合约
        require(
            gemToken.transferFrom(msg.sender, address(this), totalCost),
            "BlindBox: GEM transfer failed"
        );
        
        if (amount == 1) {
            // 单个铸造
            uint256 metadataIndex = _getRandomUnusedIndex();
            uint256 tokenId = genesisMecha.safeMint(msg.sender);
            genesisMecha.setTokenMetadata(tokenId, metadataIndex);
            
            emit Minted(msg.sender, tokenId, mintPrice, block.timestamp);
        } else {
            // 批量铸造
            uint256[] memory tokenIds = genesisMecha.safeMintBatch(msg.sender, amount);
            uint256[] memory metadataIndices = new uint256[](amount);
            
            for (uint256 i = 0; i < amount; i++) {
                metadataIndices[i] = _getRandomUnusedIndex();
            }
            
            genesisMecha.setTokenMetadataBatch(tokenIds, metadataIndices);
            emit BatchMinted(msg.sender, tokenIds, totalCost, block.timestamp);
        }
        
        // 更新统计数据
        totalMinted += amount;
        totalRevenue += totalCost;
        userMintCount[msg.sender] += amount;
    }
    
    /**
     * @dev 设置铸造价格 (仅限合约拥有者)
     * @param _newPrice 新的铸造价格
     */
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "BlindBox: Invalid price");
        
        uint256 oldPrice = mintPrice;
        mintPrice = _newPrice;
        
        emit PriceUpdated(oldPrice, _newPrice);
    }
    
    /**
     * @dev 提取收益 (仅限合约拥有者)
     * @param to 接收地址
     * @param amount 提取数量 (0表示提取全部)
     */
    function withdrawRevenue(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "BlindBox: Invalid recipient");
        
        uint256 balance = gemToken.balanceOf(address(this));
        require(balance > 0, "BlindBox: No revenue to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "BlindBox: Insufficient balance");
        
        require(
            gemToken.transfer(to, withdrawAmount),
            "BlindBox: Transfer failed"
        );
        
        emit RevenueWithdrawn(to, withdrawAmount);
    }
    
    /**
     * @dev 暂停合约 (仅限合约拥有者)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约 (仅限合约拥有者)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 获取合约状态信息
     */
    function getContractInfo() external view returns (
        uint256 currentPrice,
        uint256 totalSupply,
        uint256 remainingSupply,
        uint256 minted,
        uint256 revenue,
        bool soldOut,
        bool paused
    ) {
        return (
            mintPrice,
            genesisMecha.MAX_SUPPLY(),
            genesisMecha.remainingSupply(),
            totalMinted,
            totalRevenue,
            genesisMecha.isSoldOut(),
            this.paused()
        );
    }
    
    /**
     * @dev 获取用户信息
     * @param user 用户地址
     */
    function getUserInfo(address user) external view returns (
        uint256 gemBalance,
        uint256 gemAllowance,
        uint256 nftBalance,
        uint256 mintedCount
    ) {
        return (
            gemToken.balanceOf(user),
            gemToken.allowance(user, address(this)),
            genesisMecha.balanceOf(user),
            userMintCount[user]
        );
    }

    /**
     * @dev 随机选择一个未使用的元数据索引
     * @return metadataIndex 选中的元数据索引 (1-20)
     */
    function _getRandomUnusedIndex() private returns (uint256) {
        require(_remainingIndices > 0, "BlindBox: No more metadata indices available");

        // 生成随机数
        uint256 randomValue = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            totalMinted,
            msg.sender,
            tx.origin
        ))) % _remainingIndices;

        // 找到第randomValue个未使用的索引
        uint256 count = 0;
        for (uint256 i = 1; i <= MAX_SUPPLY; i++) {
            if (!_usedMetadataIndices[i]) {
                if (count == randomValue) {
                    _usedMetadataIndices[i] = true;
                    _remainingIndices--;
                    return i;
                }
                count++;
            }
        }

        revert("BlindBox: Failed to find unused index");
    }

    /**
     * @dev 获取剩余可用的元数据索引数量
     */
    function getRemainingIndices() external view returns (uint256) {
        return _remainingIndices;
    }

    /**
     * @dev 检查元数据索引是否已被使用
     */
    function isMetadataIndexUsed(uint256 index) external view returns (bool) {
        require(index >= 1 && index <= MAX_SUPPLY, "BlindBox: Invalid index");
        return _usedMetadataIndices[index];
    }
}
