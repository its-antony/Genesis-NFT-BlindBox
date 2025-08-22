// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GemToken
 * @dev ERC20代币合约，用于购买盲盒NFT
 *
 * 功能特性：
 * - 标准ERC20代币实现
 * - 初始供应量：10,000,000 GEM
 * - 6位小数精度 (更适合游戏代币)
 * - 所有代币在部署时铸造给合约部署者
 */
contract GemToken is ERC20, Ownable {

    // 初始供应量：10,000,000 GEM (考虑6位小数)
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 10**6;
    
    /**
     * @dev 构造函数
     * @param initialOwner 合约初始拥有者地址
     */
    constructor(address initialOwner)
        ERC20("Gem Token", "GEM")
        Ownable(initialOwner)
    {
        // 将所有初始供应量铸造给合约部署者
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /**
     * @dev 重写decimals函数，返回6位小数
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    /**
     * @dev 铸造新代币 (仅限合约拥有者)
     * @param to 接收代币的地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev 销毁代币 (仅限合约拥有者)
     * @param from 销毁代币的地址
     * @param amount 销毁数量
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
    
    /**
     * @dev 获取代币基本信息
     * @return tokenName 代币名称
     * @return tokenSymbol 代币符号
     * @return tokenDecimals 小数位数
     * @return tokenTotalSupply 总供应量
     */
    function getTokenInfo() public view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 tokenTotalSupply
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply()
        );
    }
}
