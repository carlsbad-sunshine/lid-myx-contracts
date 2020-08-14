const { ether, BN } = require("@openzeppelin/test-helpers")

let config = {}

config.timer = {
  startTime: 1597287540,
  hardCapTimer: 604800,
  softCap: ether("0"),
}

config.redeemer = {
  redeemBP: 200,
  redeemInterval: 3600,
  bonusRangeStart: [
    ether("0"),
    ether("100"),
    ether("500"),
    ether("900")
  ],
  bonusRangeBP: [
    1000,
    500,
    250,
    0
  ]
}

config.presale = {
  maxBuyPerAddress: ether("20"),
  maxBuyWithoutWhitelisting: ether("20"),
  uniswapEthBP: 6000,
  lidEthBP: 0,
  referralBP: 250,
  hardcap: ether("1000"),
  token: "0x2129ff6000b95a973236020bcd2b2006b0d8e019",
  uniswapTokenBP: 1700,
  presaleTokenBP: 4300,
  tokenDistributionBP: {
    dao: 3000,
    team: 500,
    marketing: 500
  }
}

module.exports = config
