const ERC20 = artifacts.require("ERC20");

contract('ERC20', accounts => {
  let erc20;
  const initSupply = 100;
  const amt = 20;
  const symbol = 'test';


  beforeEach(async () => {
    erc20 = await ERC20.new(initSupply, symbol, {from: accounts[1]});
  });

  it('symbol', async () => {
    const sym = await erc20.symbol.call();
    assert.equal(sym, symbol);
  });

  it('totalSupply', async () => {
    const total = await erc20.totalSupply.call();
    assert.equal(total.toNumber(), initSupply);
  });

  it('balanceOf', async () => {
    const bal1 = await erc20.balanceOf.call(accounts[1]);
    const bal2 = await erc20.balanceOf.call(accounts[2]);
    assert.equal(bal1.toNumber(), 100);
    assert.equal(bal2.toNumber(), 0);
  });

  it('transfer', async () => {
    const tx = await erc20.transfer(accounts[2], amt, {from: accounts[1]});

    const bal1 = await erc20.balanceOf.call(accounts[1]);
    const bal2 = await erc20.balanceOf.call(accounts[2]);
    assert.equal(bal1.toNumber(), initSupply-amt);
    assert.equal(bal2.toNumber(), amt);

    const logs = tx.logs;
    assert.equal(logs.length, 1);
    assert.equal(logs[0].event, 'Transfer');
    const expectedArgs = {
      from: accounts[1],
      to: accounts[2],
      value: bal2
    };
    assert.equal(JSON.stringify(logs[0].args), JSON.stringify(expectedArgs));
  });

  it('approve', async () => {
    const tx = await erc20.approve(accounts[2], amt, {from: accounts[1]});
    const logs = tx.logs;
    assert.equal(logs.length, 1);
    assert.equal(logs[0].event, 'Approval');
    const expectedArgs = {
      owner: accounts[1],
      spender: accounts[2],
      value: web3.toBigNumber(amt)
    };
    assert.equal(JSON.stringify(logs[0].args), JSON.stringify(expectedArgs));
  });

  it('allowance', async () => {
    await erc20.approve(accounts[2], amt, {from: accounts[1]});
    const allowance = await erc20.allowance(accounts[1], accounts[2]);
    assert.equal(allowance.toNumber(), amt);
  });

  it('transferFrom', async() => {
    await erc20.approve(accounts[2], amt, {from: accounts[1]});
    await erc20.transferFrom(accounts[1], accounts[2], amt, {from: accounts[2]});
    const bal1 = await erc20.balanceOf.call(accounts[1]);
    const bal2 = await erc20.balanceOf.call(accounts[2]);
    assert.equal(bal1.toNumber(), initSupply-amt);
    assert.equal(bal2.toNumber(), amt);
  });

  it('transfer reverts', async () => {
    try {
      await erc20.transfer(accounts[3], amt, {from: accounts[2]});
      assert(false);
    } catch(e) {
      assert(e.toString().indexOf('revert') !== 1);
    }
  });

  it('approve reverts', async () => {
    try {
      await erc20.approve(accounts[3], amt, {from: accounts[2]});
      assert(false);
    } catch(e) {
      assert(e.toString().indexOf('revert') !== 1);
    }
  });

  it('transferFrom reverts', async () => {
    try {
      await erc20.transferFrom(accounts[4], accounts[3], amt, {from: accounts[2]});
      assert(false);
    } catch(e) {
      assert(e.toString().indexOf('revert') !== 1);
    }
  });
});