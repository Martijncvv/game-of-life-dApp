// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract GameOfLife {

    event NewSetup(address indexed user, uint256 timestamp, uint256 startNodeAmount, uint256 generationsAlive, uint256 maxLivingNodesRecord);
    event SetupLiked(address indexed user, uint256 setupId, uint256 likes);


    uint totalSetupsCount = 0;
    address[] public accountsSubmitted;
    mapping(address => uint256) public accountsSetupCount;

    
    struct GameSetup {
        address user; 
        uint256 startNodeAmount;
        uint256 generationsAlive;
        uint256 maxLivingNodesRecord;

        uint[] x_coordinates;
        uint[] y_coordinates;
        uint256 timestamp; 

        uint256 setupId;
        uint256 likes;
        string message;
    }

    mapping(address => GameSetup) public accountSetup;
    mapping(uint256 => GameSetup) public setupsById;

    

    constructor() {
        console.log("Game of Life");
        
    }

    function likeSetup(uint256 setupId) public {
        GameSetup storage likedSetup = setupsById[setupId];
        likedSetup.likes += 1;
     
        emit SetupLiked(msg.sender, setupId, likedSetup.likes);
    }

    function submitGameSetup(
        uint256 startNodeAmount,
        uint256 generationsAlive,
        uint256 maxLivingNodesRecord, 
        uint256[] memory x_coordinates, 
        uint256[] memory y_coordinates,
        string memory message
        ) public {
       
        require(
            x_coordinates.length > 0 && y_coordinates.length > 0 && x_coordinates.length == y_coordinates.length && startNodeAmount == x_coordinates.length,
            "Invalid coordinates input."
        );
        
        require(
            generationsAlive > 0 && maxLivingNodesRecord > 0,
            "Invalid game info input."
        );
    
        totalSetupsCount += 1;
        uint256 setupId = totalSetupsCount;

        accountsSubmitted.push(msg.sender);
        accountsSetupCount[msg.sender] += 1;
        
        uint256 likes = 0;

        GameSetup memory newSetup = GameSetup(msg.sender, startNodeAmount, generationsAlive, maxLivingNodesRecord, x_coordinates, y_coordinates, block.timestamp, setupId, likes, message);

        setupsById[setupId] = newSetup;
        accountSetup[msg.sender] = newSetup;

        // console.log("Game setup of %s added. GenerationsAlive: %s, maxLivingNodesRecord %s", msg.sender, generationsAlive, maxLivingNodesRecord);
        emit NewSetup(msg.sender, block.timestamp, startNodeAmount, generationsAlive, maxLivingNodesRecord);
       
    }

    function getAllSetups() public view returns (GameSetup[] memory) {
        GameSetup[] memory gameSetups = new GameSetup[](totalSetupsCount);
        for (uint256 i = 0; i < totalSetupsCount; i++) {
            gameSetups[i] = setupsById[i + 1];
        }
        return gameSetups;
    }

     function getSetupById(uint256 setupId) public view returns (GameSetup memory) {
        return setupsById[setupId];
    }

    function getTotalSetupsCount() public view returns (uint256) {
        console.log("We have %d total Setups!", totalSetupsCount);
        return totalSetupsCount;
    }

    function getAccountsSubmitted() public view returns(address[] memory) {
        return accountsSubmitted;
    }

    function getAccountSetupCount(address _address) public view returns (uint256) {
        uint256 accountSetupCount = accountsSetupCount[_address];
        return accountSetupCount;
    }
    function getAccountSetup(address _address) public view returns (GameSetup memory) {
        GameSetup memory setupOfAccount = accountSetup[_address];
        return setupOfAccount;
    }
}

// deployed 17 march 14:32 0x4c765e079Be54060Ad38fE9f158173aF8763bfBF