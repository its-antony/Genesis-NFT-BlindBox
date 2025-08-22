// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title GenesisMecha
 * @dev ERC721 NFT合约，代表创世纪机甲NFT
 * 
 * 功能特性：
 * - 标准ERC721 NFT实现
 * - 支持元数据URI存储
 * - 基于角色的访问控制
 * - 只有具有MINTER_ROLE的地址才能铸造NFT
 * - 自动递增的Token ID
 * - 最大供应量限制
 */
contract GenesisMecha is ERC721, ERC721URIStorage, AccessControl {

    // 角色定义
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Token ID计数器
    uint256 private _currentTokenId;
    
    // 最大供应量 (限制为20个用于测试)
    uint256 public constant MAX_SUPPLY = 20;
    
    // 基础URI
    string private _baseTokenURI;

    using Strings for uint256;

    // 事件
    event MechaCreated(uint256 indexed tokenId, address indexed to, uint256 metadataIndex);
    event BaseURIUpdated(string newBaseURI);
    
    /**
     * @dev 构造函数
     * @param defaultAdmin 默认管理员地址
     * @param minter 初始铸造者地址 (通常是BlindBox合约地址)
     */
    constructor(
        address defaultAdmin,
        address minter
    ) ERC721("Genesis Mecha", "GMECHA") {
        // 设置角色
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);

        // 初始化Token ID从1开始
        _currentTokenId = 1;
    }
    
    /**
     * @dev 安全铸造NFT (仅限MINTER_ROLE)
     * @param to 接收NFT的地址
     * @return tokenId 新铸造的Token ID
     */
    function safeMint(address to) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _currentTokenId;
        require(tokenId <= MAX_SUPPLY, "GenesisMecha: Max supply exceeded");

        _currentTokenId++;
        _safeMint(to, tokenId);

        return tokenId;
    }
    
    /**
     * @dev 批量铸造NFT (仅限MINTER_ROLE)
     * @param to 接收NFT的地址
     * @param amount 铸造数量
     * @return tokenIds 新铸造的Token ID数组
     */
    function safeMintBatch(address to, uint256 amount)
        public
        onlyRole(MINTER_ROLE)
        returns (uint256[] memory tokenIds)
    {
        require(amount > 0 && amount <= 10, "GenesisMecha: Invalid amount");
        require(
            _currentTokenId + amount - 1 <= MAX_SUPPLY,
            "GenesisMecha: Max supply exceeded"
        );

        tokenIds = new uint256[](amount);

        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _currentTokenId;

            _currentTokenId++;
            _safeMint(to, tokenId);

            tokenIds[i] = tokenId;
        }

        return tokenIds;
    }
    
    /**
     * @dev 设置特定Token的URI (仅限MINTER_ROLE)
     * @param tokenId Token ID
     * @param metadataIndex 元数据索引
     */
    function setTokenMetadata(uint256 tokenId, uint256 metadataIndex) public onlyRole(MINTER_ROLE) {
        require(_ownerOf(tokenId) != address(0), "GenesisMecha: Token does not exist");
        require(metadataIndex >= 1 && metadataIndex <= MAX_SUPPLY, "GenesisMecha: Invalid metadata index");

        string memory tokenUri = string(abi.encodePacked(metadataIndex.toString(), ".json"));
        _setTokenURI(tokenId, tokenUri);

        emit MechaCreated(tokenId, _ownerOf(tokenId), metadataIndex);
    }

    /**
     * @dev 批量设置Token的URI (仅限MINTER_ROLE)
     * @param tokenIds Token ID数组
     * @param metadataIndices 元数据索引数组
     */
    function setTokenMetadataBatch(uint256[] memory tokenIds, uint256[] memory metadataIndices) public onlyRole(MINTER_ROLE) {
        require(tokenIds.length == metadataIndices.length, "GenesisMecha: Arrays length mismatch");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            uint256 metadataIndex = metadataIndices[i];

            require(_ownerOf(tokenId) != address(0), "GenesisMecha: Token does not exist");
            require(metadataIndex >= 1 && metadataIndex <= MAX_SUPPLY, "GenesisMecha: Invalid metadata index");

            string memory tokenUri = string(abi.encodePacked(metadataIndex.toString(), ".json"));
            _setTokenURI(tokenId, tokenUri);

            emit MechaCreated(tokenId, _ownerOf(tokenId), metadataIndex);
        }
    }

    /**
     * @dev 设置基础URI (仅限DEFAULT_ADMIN_ROLE)
     * @param baseURI 新的基础URI
     */
    function setBaseURI(string memory baseURI) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    /**
     * @dev 获取基础URI
     * @return 当前的基础URI
     */
    function getBaseURI() public view returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev 设置特定Token的URI (仅限DEFAULT_ADMIN_ROLE)
     * @param tokenId Token ID
     * @param uri Token URI
     */
    function setTokenURI(uint256 tokenId, string memory uri)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setTokenURI(tokenId, uri);
    }
    
    /**
     * @dev 获取当前总供应量
     * @return 当前已铸造的NFT数量
     */
    function totalSupply() public view returns (uint256) {
        return _currentTokenId - 1;
    }
    
    /**
     * @dev 获取剩余可铸造数量
     * @return 剩余可铸造的NFT数量
     */
    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    /**
     * @dev 检查是否已售罄
     * @return 是否已售罄
     */
    function isSoldOut() public view returns (bool) {
        return totalSupply() >= MAX_SUPPLY;
    }
    
    // 重写必要的函数
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
