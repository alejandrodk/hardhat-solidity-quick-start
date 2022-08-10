import { expect } from "chai";
import { ethers } from "hardhat"; // hardhat runtime environment
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("Lock", () => {
  async function deployOneYearLockFixture() {
    const lockedAmount = 1_000_000_000;
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { lock, unlockTime, lockedAmount };
  }

  it("Should set the right unlockTime", async () => {
    const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);
    // all Functions on contract are Async, await the result to compare
    // values in a synchronous way
    expect(await lock.unlockTime()).to.equal(unlockTime);
  });

  it("Should revert with the right error if called to soon", async () => {
    const { lock } = await loadFixture(deployOneYearLockFixture);
    // the whole assertion is async because it has yo wait until the transaction
    // is mined, so the "expect" call returns a promise
    await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
  });

  it("Should transfer the funds to the owner", async () => {
    try {
      const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);
      // mine a new block with the given timestamp
      await time.increaseTo(unlockTime);
      // should withdraw the funds
      await lock.withdraw();
    } catch (e) {
      expect(e).to.be.undefined;
    }
  });

  it("Should revert with the right error if called from another account", async () => {
    const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);
    // ethers.getSigners returns an array with all the configured accounts,
    // by default, deployments and functions calls are done with the first
    // configured account. The first account always will be the owner.
    const [owner, notOwner] = await ethers.getSigners();

    // increase the time of the chain to pass the first check
    await time.increaseTo(unlockTime);

    // use lock.connect() to send a transaction from another account
    await expect(lock.connect(notOwner).withdraw()).to.be.revertedWith(
      "You aren't the owner"
    );
  });
});
