const { accounts, contract, web3 } = require("@openzeppelin/test-environment")
const { expectRevert, time, BN, ether, balance, send } = require("@openzeppelin/test-helpers")
const {expect} = require("chai")
const config = require("../config")

const LidSimplifiedPresaleRedeemer = contract.fromArtifact("LidSimplifiedPresaleRedeemer")

const owner = accounts[0]
const presale = accounts[1]
const depositors = [accounts[2], accounts[3], accounts[4]]

const SECONDS_PER_HOUR = 3600
const TOTAL_TOKENS = ether("1000000000")
const PRESALE_TOKENS = ether("430000000")

describe("LidSimplifiedPresaleRedeemer", function() {
  before(async function() {
    const redeemerParams = config.redeemer
    this.redeemer = await LidSimplifiedPresaleRedeemer.new()
    await this.redeemer.initialize(
      redeemerParams.redeemBP,
      redeemerParams.redeemInterval,
      redeemerParams.bonusRangeStart,
      redeemerParams.bonusRangeBP,
      presale,
      owner
    )
  })

  describe("#calculateRatePerEth", function() {
    it("should be 454807 @ 0 eth", async function() {
      const rate = await this.redeemer.calculateRatePerEth(
        PRESALE_TOKENS,
        ether("0"),
        config.presale.hardcap
      )
      expect(rate.div(new BN(ether("1"))).toString())
      .to.equal("454807")
    })
    it("should be 434134 @ 100 eth", async function() {
      const rate = await this.redeemer.calculateRatePerEth(
        PRESALE_TOKENS,
        ether("100"),
        config.presale.hardcap
      )
      expect(rate.div(new BN(ether("1"))).toString())
      .to.equal("434134")
    })
    it("should be 423798 @ 500 eth", async function() {
      const rate = await this.redeemer.calculateRatePerEth(
        PRESALE_TOKENS,
        ether("500"),
        config.presale.hardcap
      )
      expect(rate.div(new BN(ether("1"))).toString())
      .to.equal("423798")
    })
    it("should be 413461 @ 900 eth", async function() {
      const rate = await this.redeemer.calculateRatePerEth(
        PRESALE_TOKENS,
        ether("900"),
        config.presale.hardcap
      )
      expect(rate.div(new BN(ether("1"))).toString())
      .to.equal("413461")
    })
    it("should be 413461 @ 999 eth", async function() {
      const rate = await this.redeemer.calculateRatePerEth(
        PRESALE_TOKENS,
        ether("999"),
        config.presale.hardcap
      )
      expect(rate.div(new BN(ether("1"))).toString())
      .to.equal("413461")
    })
  })

  describe("#setDeposit", function() {
    it("Should revert from non presale", async function() {
      await expectRevert(
        this.redeemer.setDeposit(depositors[0], ether("1"), ether("1")),
        "Only callable by presale contract."
      )
    })
    describe("First", function() {
      before(async function() {
        await this.redeemer.setDeposit(depositors[0], ether("1"), ether("0"), {from: presale})
      })
      it("Should increase totalDepositors", async function() {
        const totalDepositors = await this.redeemer.totalDepositors()
        expect(totalDepositors.toString()).to.equal("1")
      })
      it("Should increase accounts deposit", async function() {
        const accountDeposit = await this.redeemer.accountDeposits(depositors[0])
        expect(accountDeposit.toString()).to.equal(ether("1").toString())
      })
      it("Should increase accounts shares", async function() {
        const accountShares = await this.redeemer.accountShares(depositors[0])
        expect(accountShares.toString()).to.equal(
          (new BN(ether("1")))
          .mul((new BN(config.redeemer.bonusRangeBP[0].toString())).add(new BN("10000")))
          .div(new BN("10000"))
          .toString()
        )
      })
    })
    describe("second", function() {
      before(async function() {
        await this.redeemer.setDeposit(depositors[0], ether("1"), ether("0"), {from: presale})
      })
      it("Should not change totalDepositors", async function() {
        const totalDepositors = await this.redeemer.totalDepositors()
        expect(totalDepositors.toString()).to.equal("1")
      })
      it("Should increase accounts deposit", async function() {
        const accountDeposit = await this.redeemer.accountDeposits(depositors[0])
        expect(accountDeposit.toString()).to.equal(ether("2").toString())
      })
      it("Should increase accounts shares", async function() {
        const accountShares = await this.redeemer.accountShares(depositors[0])
        expect(accountShares.toString()).to.equal(
          (new BN(ether("1")))
          .mul((new BN(config.redeemer.bonusRangeBP[0].toString())).add(new BN("10000")))
          .mul(new BN("2"))
          .div(new BN("10000"))
          .toString()
        )
      })
    })
  })
  describe("#setClaimed", function() {
    it("Should revert from non presale", async function() {
      await expectRevert(
        this.redeemer.setClaimed(depositors[0], ether("1")),
        "Only callable by presale contract."
      )
    })
    it("Should increase accountClaimedTokens", async function() {
      await this.redeemer.setClaimed(depositors[0], ether("1"), {from: presale})
      const accountClaimedTokens = await this.redeemer.accountClaimedTokens(depositors[0])
      expect(accountClaimedTokens.toString()).to.equal(ether("1").toString())
    })

  })

})
