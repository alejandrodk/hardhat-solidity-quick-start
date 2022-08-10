import { expect } from "chai";
import hre, { ethers } from "hardhat"; // hardhat runtime environment
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Contract } from "ethers";

describe("Lock", () => {
  let lock: Contract;
  let unlockTime: number;
  let lockedAmount = 1_000_000;

  beforeEach(async () => {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    // time.latest returns the timestamp of the last minted block
    unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // deploy a lock contract where funds can be withdrawn
    // after 1 year
    const Lock = await hre.ethers.getContractFactory("Lock");
    lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  })

  it("Should set the right unlockTime", async () => {
    // all Functions on contract are Async, await the result to compare
    // values in a synchronous way
    expect(await lock.unlockTime()).to.equal(unlockTime);
  });

  it("Should revert with the right error if called to soon", async () => {
    // the whole assertion is async because it has yo wait until the transaction
    // is mined, so the "expect" call returns a promise
    await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
  });

  it("Should transfer the funds to the owner", async () => {
    try {
      // mine a new block with the given timestamp
      await time.increaseTo(unlockTime);
      // should withdraw the funds
      await lock.withdraw();
    } catch (e) {
      expect(e).to.be.undefined;
    }
  });
});
