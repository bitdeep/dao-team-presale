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

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

/**
 * @author bitdeep
 * @title SPECTRE DAO Initial Team Offering
 * @notice some description
 */
contract teamPresale is Ownable {
    using SafeERC20 for IERC20;
    event Claimed(address indexed account, uint amountTotal, uint vested);
    event Released(address indexed account, uint releasable);
    event Received(address indexed account, uint amount);
    event Whitelist(address indexed account, bool status);

    uint public PRICE = 20 ether; // 20 FTM
    uint public START;
    uint public END;
    uint public vestStart;
    uint public totalProvided = 0;
    mapping(address => bool) public whitelist;
    mapping(address => uint) public tokens;
    mapping(address => uint) public vest;
    mapping(address => uint) public released;
    IERC20 public immutable TOKEN;
    uint64 private immutable duration = 30 days * 6; // ~ 6 months

    constructor(IERC20 token) {
        START = block.number;
        END = START + 7 days;
        vestStart = END + 30 days;
        TOKEN = token;
    }
    receive() external payable {
        require(msg.value > 100000000000000000, "Insufficient funds sent");
        require(whitelist[msg.sender], "Not whitelisted");
        require(START <= block.timestamp, "The offering has not started yet");
        require(block.timestamp <= END, "The offering has already ended");
        totalProvided += msg.value;
        uint amount = (msg.value / 1e9) / PRICE;
        require(amount <= TOKEN.balanceOf(address(this)), "Insufficient contract balance");
        tokens[msg.sender] += amount;
        emit Received(msg.sender, msg.value);
    }

    function claim() external {
        require(block.timestamp > END, "Claim period ended");
        require(tokens[msg.sender] > 0, "No tokens to claim");
        uint amountTotal = tokens[msg.sender];

        // only 50%
        uint amount = amountTotal / 2;

        // vest 50%
        vest[msg.sender] += amount;
        tokens[msg.sender] = 0;
        TOKEN.safeTransfer(msg.sender, amount);
        emit Claimed(msg.sender, amountTotal, amount);
    }

    function release() external {
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
        START = _start;
        END = _end;
    }

    function setPrice(uint _val) external onlyOwner {
        PRICE = _val;
    }

    function setWhitelistStatus(address _wallet, bool _status) external onlyOwner {
        whitelist[_wallet] = _status;
        emit Whitelist(_wallet, _status);
    }

}
