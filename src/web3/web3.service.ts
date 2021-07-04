import { Injectable } from '@nestjs/common';
import { AbiInput } from 'web3-utils';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { ERC20ABI } from './abi/erc20-abi';

@Injectable()
export class Web3Service {
  httpProvider = new Web3.providers.HttpProvider(process.env.BSC_RPC_ENDPOINT, {
    timeout: 10000,
  });

  MAX_UINT =
    '115792089237316195423570985008687907853269984665640564039457584007913129639935';

  client: Web3;

  rpcProvider = new ethers.providers.JsonRpcProvider(
    process.env.BSC_RPC_ENDPOINT,
  );

  constructor() {
    this.client = new Web3(this.httpProvider);
  }

  getBalance(address: string): Promise<string> {
    return this.getClient().eth.getBalance(address);
  }

  getClient(): Web3 {
    return this.client;
  }

  getRpcProvider() {
    return this.rpcProvider;
  }

  getContract(abi: any, address: string): any {
    return new (this.getClient().eth.Contract)(abi, address);
  }

  getEthersContract(abi: any, address: string): any {
    return new ethers.Contract(address, abi, this.rpcProvider);
  }

  getWallet(privateKey: string): any {
    const wallet = this.getClient().eth.accounts.privateKeyToAccount(
      privateKey,
    );
    return wallet;
  }

  async approveSpend(
    wallet,
    token: string,
    approved: string,
    amount = this.MAX_UINT,
  ) {
    const contract = this.getContract(ERC20ABI, token);

    const transaction = contract.methods.approve(approved, amount);

    const encodedABI = transaction.encodeABI();
    const tx = {
      from: wallet.address,
      to: token,
      gas: 200000,
      data: encodedABI,
    };

    const signedTx = await wallet.signTransaction(tx);
    return this.getClient().eth.sendSignedTransaction(signedTx.rawTransaction);
  }

  getTransaction(transactionHash: string): any {
    return this.getClient().eth.getTransactionReceipt(transactionHash);
  }

  getDecodedLog(abi: AbiInput[], byteData: string, topics: string[]): any {
    return this.getClient().eth.abi.decodeLog(abi, byteData, topics);
  }
}
