import React, { Component } from "react";
import Auction from "./build/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {value: '', errorMessage: '', web3: null, accounts: null, contract: null};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleWithdraw = this.handleWithdraw.bind(this);
    this.getMoney = this.getMoney.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Auction.networks[networkId];
      const instance = new web3.eth.Contract(
        Auction.abi,
        deployedNetwork && deployedNetwork.address,
      );
      instance.options.address = '0x1C5E0FA958Aec0D4A0D05722B0ac86b27752938a';

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  async handleSubmit(event) {
    event.preventDefault();
    await this.updateValue();
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  async handleWithdraw() {
    const { accounts, contract } = this.state;
    await contract.methods.withdraw().send({ from: accounts[0] });
  }

  async getMoney() {
    const { accounts, contract } = this.state;
    await contract.methods.transferToOwner().send({ from: accounts[0] });
  }

  updateValue = async () => {
    const { accounts, contract, value } = this.state;
    await contract.methods.bid().send({ from: accounts[0], value: value }); 
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>Auction System</h2>
        <h5>Enter the value you want to offer:</h5>
              <form onSubmit={this.handleSubmit} >
                <div className="form-group">
                  <input id="newValue" value = {this.state.value} onChange={this.handleChange} className="form-control" type="text"></input>
                </div>
                <button type="submit" className="Button btn btn-primary">Bid</button>
              </form>
        <div>The bid value is: {this.state.value}</div>
        <div className="Buttons">
          <button type="submit" className="Button btn btn-primary" onClick={this.handleWithdraw}>Withdraw</button>
          <button type="submit" className="Button btn btn-primary" onClick={this.getMoney}>Get money from auction</button>
        </div>
        {this.state.errorMessage !== '' && <div className="Error">{this.state.errorMessage}</div>}
      </div>
    );
  }
}

export default App;
