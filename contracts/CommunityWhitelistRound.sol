/**
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Hegic
 * Copyright (C) 2020 Hegic Protocol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// import "hardhat/console.sol";

/**
 * @author bitdeep
 * @title SPECTRE DAO Community Whitelist Round
 * @notice some description
 */
contract CommunityWhitelistRound is Ownable {
    using SafeERC20 for IERC20;
    event Claimed(address indexed account, uint amountTotal, uint vested);
    event Released(address indexed account, uint releasable);
    event Received(address indexed account, uint amount);
    event Whitelist(address indexed account, bool status);

    uint public presalePrice = 25 ether; // 25 FTM
    uint public presaleLimit = 40e9; // max of 40 tokens
    uint public presaleStart;
    uint public presaleEnd;
    uint public vestStart;
    uint public totalProvided = 0;
    uint public totalWhiteListed = 0;
    mapping(address => bool) public whitelist;
    mapping(address => uint) public tokens;
    mapping(address => uint) public vest;
    mapping(address => uint) public released;
    IERC20 public immutable TOKEN;
    uint64 private immutable duration = 30 days * 6; // ~ 6 months

    constructor(IERC20 token) {
        TOKEN = token;
    }

    receive() external payable {
        require(msg.value > 100000000000000000, "Insufficient funds sent");
        require(whitelist[msg.sender], "Not whitelisted");
        require(presaleStart <= block.timestamp, "The offering has not started yet");
        require(block.timestamp < presaleEnd, "The offering has already ended");
        totalProvided += msg.value;
        uint amount = ((msg.value * 1e18) / presalePrice) / 1e9;
        require(amount <= TOKEN.balanceOf(address(this)), "Insufficient contract balance");
        tokens[msg.sender] += amount;
        require(tokens[msg.sender] <= presaleLimit,"Max of 40 GHAST per user");
        emit Received(msg.sender, msg.value);
    }

    function claim() external {
        require(block.timestamp >= presaleEnd, "Claim not open yet");
        require(whitelist[msg.sender], "Not whitelisted");
        require(tokens[msg.sender] > 0, "No tokens to claim");
        uint amountTotal = tokens[msg.sender];
        uint amount = amountTotal / 2;
        vest[msg.sender] += amount;
        tokens[msg.sender] = 0;
        TOKEN.safeTransfer(msg.sender, amount);
        emit Claimed(msg.sender, amountTotal, amount);
    }

    function release() external {
        require(whitelist[msg.sender], "Not whitelisted");
        address beneficiary = msg.sender;
        uint256 releasable = vestedAmount(beneficiary, uint64(block.timestamp)) - released[beneficiary];
        released[beneficiary] += releasable;
        TOKEN.safeTransfer(beneficiary, releasable);
        emit Released(beneficiary, releasable);
    }

    function vestedAmount(address user, uint64 timestamp) public view virtual returns (uint256) {
        return _vestingSchedule(vest[user] + released[user], timestamp);
    }

    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view virtual returns (uint256) {
        if (timestamp < vestStart) {
            return 0;
        } else if (timestamp > vestStart + duration) {
            return totalAllocation;
        } else {
            return (totalAllocation * (timestamp - vestStart)) / duration;
        }
    }

    function withdrawProvidedETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setStartEnd(uint _start, uint _end) external onlyOwner {
        presaleStart = _start;
        presaleEnd = _end;
        vestStart = presaleEnd + 30 days;
    }

    function setPrice(uint _val) external onlyOwner {
        presalePrice = _val;
    }

    function setWhitelistStatus(address _wallet, bool _status) external onlyOwner {
        whitelist[_wallet] = _status;
        if (_status) totalWhiteListed++;
        else totalWhiteListed--;
        require(totalWhiteListed <= 1500, "1500 whitelisted users only");
        emit Whitelist(_wallet, _status);
    }

    function getChainId() public view returns (uint) {
        uint256 chainId;
        assembly {chainId := chainid()}
        return chainId;
    }
    // to test vest, must be commented
    function devEnvReconfigureValues(uint _vestStart) external onlyOwner {
        // revert if not on test env
        // ATTENTION: FTM is 250
        require(getChainId() == 1, "only test env");
        vestStart = _vestStart;
    }
    function getTimestamp() public view returns (uint){
        return block.timestamp;
    }

}
