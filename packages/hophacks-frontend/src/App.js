import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css'; //modify for antd
import ERC20 from 'hophacks-contracts/build/contracts/ERC20.json';
import Web3 from 'web3';
import contract from 'truffle-contract';
import {Layout, Spin, Row, Col, Card, Button, Modal, Input} from 'antd';

const {Content} = Layout;
const {TextArea} = Input;
const gas = Math.pow(10, 6);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      erc20: null,
      loaded: false,
      transferVis: false,
      approveVis: false,
      transferFromVis: false,
      recieptVis: false,
      reciept: ''
    }
  }

  /*
    CONTRACT STUFF STARTS HERE
  */
  async componentDidMount() {
    const provider = window.web3.currentProvider;
    const web3 = new Web3(provider);
    console.log(web3);

    let erc20 = contract(ERC20);
    erc20.setProvider(web3.currentProvider);
    erc20 = await erc20.deployed();
    this.setState({
      ...this.state,
      web3,
      erc20
    });

    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    const symbol = await erc20.symbol.call();
    let balance = await erc20.balanceOf.call(accounts[0]);
    balance = balance.toNumber();

    this.setState({
      ...this.state,
      accounts,
      symbol,
      balance,
      loaded: true,
      inputAddress: '',
      inputValue: ''
    });
  }

  transfer = async (address, value) => {
    const erc20 = this.state.erc20;
    const to = Web3.utils.toChecksumAddress(address);
    const tx = await erc20.transfer(to, value, {from:this.state.accounts[0], gas});
    this.setState({
      ...this.state,
      transferVis:false,
      recieptVis: true,
      reciept:JSON.stringify(tx, null, 2)
    });
  }

  approve = async (address, value) => {
    const erc20 = this.state.erc20;
    const to = Web3.utils.toChecksumAddress(address);
    const tx = await erc20.approve(to, value, {from:this.state.accounts[0], gas});
    this.setState({
      ...this.state,
      approveVis:false,
      recieptVis: true,
      reciept:JSON.stringify(tx, null, 2)
    });
  }

  transferFrom = async (address, value) => {
    const erc20 = this.state.erc20;
    const sender = Web3.utils.toChecksumAddress(address);
    const tx = await erc20.transferFrom(sender, this.state.accounts[0], value, {from:this.state.accounts[0], gas});
    this.setState({
      ...this.state,
      transferFromVis:false,
      recieptVis: true,
      reciept:JSON.stringify(tx, null, 2)
    });
  }

  /*
    CONTRACT STUFF ENDS HERE
  */

  wrapContent = (content) => {
    return (
      <Layout style={{minHeight:'100vh'}}>
        <Content style={{minWidth:600, margin:'0 auto', backgroundColor:'white', padding:'50px 24px 50px 24px'}}>
          {content}
        </Content>
      </Layout>
    );
  }

  render() {
    console.log(this.state);
    if(!this.state.loaded) {
      return this.wrapContent(
        <Spin/>
      );
    }
    const accounts = this.state.accounts;
    const title = (
      <p>
        {this.state.symbol + ' wallet for '}
        <small> {accounts[0]} </small>
      </p>
    );

    const transferModal = (
      <Modal
        visible={this.state.transferVis}
        onOk={()=>this.transfer(this.state.inputAddress, this.state.inputValue)}
        onCancel={() => this.setState({...this.state, transferVis: false})}
        title='Transfer tokens'
      >
        <Input
          placeholder='Receiver Address'
          value={this.state.inputAddress}
          onChange={e=>this.setState({...this.state, inputAddress:e.target.value})}
        />
        <p></p>
        <Input
          placeholder='Amount'
          value={this.state.inputValue}
          onChange={e=>this.setState({...this.state, inputValue:e.target.value})}
        />
      </Modal>
    );

    const approveModal = (
      <Modal
        visible={this.state.approveVis}
        onOk={()=>this.approve(this.state.inputAddress, this.state.inputValue)}
        onCancel={() => this.setState({...this.state, approveVis: false})}
        title='Appove a transfer of your tokens'
      >
        <Input
          placeholder='Receiver Address'
          value={this.state.inputAddress}
          onChange={e=>this.setState({...this.state, inputAddress:e.target.value})}
        />
        <p></p>
        <Input
          placeholder='Amount'
          value={this.state.inputValue}
          onChange={e=>this.setState({...this.state, inputValue:e.target.value})}
        />
      </Modal>
    );

    const transferFromModal = (
      <Modal
        visible={this.state.transferFromVis}
        onOk={()=>this.transferFrom(this.state.inputAddress, this.state.inputValue)}
        onCancel={() => this.setState({...this.state, transferFromVis: false})}
        title='Transfer tokens in your allowance'
      >
        <Input
          placeholder='Sender address'
          value={this.state.inputAddress}
          onChange={e=>this.setState({...this.state, inputAddress:e.target.value})}
        />
        <p></p>
        <Input
          placeholder='Amount'
          value={this.state.inputValue}
          onChange={e=>this.setState({...this.state, inputValue:e.target.value})}
        />
      </Modal>
    );

    const recieptModal = (
      <Modal
        title='Reciept'
        onOk={()=>window.location.reload(false)}
        onCancel={()=>window.location.reload(false)}
        visible={this.state.recieptVis}
      >
        <TextArea
          value={this.state.reciept}
          rows={20}
          style={{fontSize:'10px'}}
        />
      </Modal>
    );

    return this.wrapContent(
      <div>
        <Card title={title}>
          <Row>
            <Col span={12}>
              <p> <Button onClick={()=>this.setState({...this.state, transferVis: true})}> transfer </Button> </p>
              <p> <Button onClick={()=>this.setState({...this.state, approveVis: true})} type='primary'> approve </Button> </p>
              <p> <Button onClick={()=>this.setState({...this.state, transferFromVis: true})} type='dashed'> transferFrom </Button> </p>
            </Col>
            <Col span={12}>
              <p style={{marginBottom:0}}> <small> Current balance: </small> </p>
              <h1 style={{fontSize:'30px'}}> {this.state.balance} </h1>
            </Col>

          </Row>
        </Card>
        {transferModal}
        {recieptModal}
        {approveModal}
        {transferFromModal}
      </div>
    );
  }
}

export default App;
