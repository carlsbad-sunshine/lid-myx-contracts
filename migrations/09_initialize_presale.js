const { scripts, ConfigManager } = require("@openzeppelin/cli")
const { add, push, create } = scripts
const {publicKey} = require("../privatekey")

const config = require("../config")

const LidSimplifiedPresaleTimer = artifacts.require("LidSimplifiedPresaleTimer")
const LidSimplifiedPresaleRedeemer = artifacts.require("LidSimplifiedPresaleRedeemer")
const LidSimplifiedPresale = artifacts.require("LidSimplifiedPresale")

async function initialize(accounts,networkName) {
  let owner = accounts[0]

  const presaleParams = config.presale

  const timer =    await LidSimplifiedPresaleTimer.deployed()
  const redeemer = await LidSimplifiedPresaleRedeemer.deployed()
  const presale =  await LidSimplifiedPresale.deployed()

  await presale.initialize(
      presaleParams.maxBuyPerAddress,
      presaleParams.maxBuyWithoutWhitelisting,
      presaleParams.uniswapEthBP,
      presaleParams.lidEthBP,
      presaleParams.referralBP,
      presaleParams.hardcap,
      owner,
      timer.address,
      redeemer.address,
      presaleParams.token,
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      "0xb63c4F8eCBd1ab926Ed9Cb90c936dffC0eb02cE2"
    )
}

module.exports = function(deployer, networkName, accounts) {
  deployer.then(async () => {
    await initialize(accounts,networkName)
  })
}
