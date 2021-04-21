pragma solidity ^0.5.0;

contract Auction {
    // the owner of the auction
    address payable public owner;
    // the start time of the auction
    uint256 public startTime;
    // the end time of the auction
    uint256 public endTime;

    // the current highest bid/bidder
    uint256 public highestBid;
    address public highestBidder;

    // mapping between bidders and the amount of money they bid
    mapping(address => uint256) amounts;

    event HighestBidIncreased(address bidder, uint256 amount);

    constructor(uint256 _startTime, uint256 _endTime) public {
        startTime = _startTime;
        endTime = _endTime;
        owner = msg.sender;
    }

    modifier notEnded() {
        require(now <= endTime, "Auction has ended.");
        _;
    }

    modifier hasEnded() {
        require(now > endTime, "Auction hasn't ended.");
        _;
    }

    modifier hasStarted() {
        require(now >= startTime, "Auction didn't start yet.");
        _;
    }

    modifier isHighestBid() {
        require(msg.value > highestBid, "There is a higher bid.");
        _;
    }

    modifier notOwner() {
        require(msg.sender != owner, "The owner can't bid.");
        _;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Access restricted to owner.");
        _;
    }

    function bid() public payable notEnded hasStarted notOwner isHighestBid {
        // if the highest bid has been overtaken, the previous highest bidder can withdraw all his money (including his highest bid) 
        if (highestBid != 0) {
            amounts[highestBidder] += highestBid;
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public payable notOwner returns (bool) {
        // you can withdraw if you are not owner
        // if you are the current highest bidder, you can not withdraw your highest bid (only the other ones)
        uint256 amount = amounts[msg.sender];
        if (amount > 0) {
            amounts[msg.sender] = 0;

            if (!msg.sender.send(amount)) {
                // if the transaction fails, the amount is added back
                amounts[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function transferToOwner() public hasEnded payable isOwner {
        // if the auction is done, transfer the money to owner
        // can be called only by the owner
        owner.transfer(highestBid);
    }
}