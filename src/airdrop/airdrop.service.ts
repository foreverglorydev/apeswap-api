import { Injectable } from '@nestjs/common';
import { Web3Service } from 'src/web3/web3.service';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import { AIRDROP_ABI } from './abi/airdropAbi';

@Injectable()
export class AirdropService {
  constructor(
    private web3Service: Web3Service,
    private configService: ChainConfigService,
  ) {}

  account = this.configService.get<string>(`airdrop.account`);
  accountKey = this.configService.get<string>(`airdrop.key`);
  contractAddress = this.configService.get<string>(`airdrop.contract`);

  async executeAirdrop(token: string, addresses: string[], amounts: string[]) {
    const wallet = this.web3Service.getWallet(this.accountKey);

    await this.web3Service.approveSpend(wallet, token, this.contractAddress);

    const contract = this.web3Service.getContract(
      AIRDROP_ABI,
      this.contractAddress,
    );

    const transaction = contract.methods.doAirdrop(token, addresses, amounts);

    const encodedABI = transaction.encodeABI();
    const tx = {
      from: wallet.address,
      to: this.contractAddress,
      gas: 9999999,
      data: encodedABI,
    };

    const signedTx = await wallet.signTransaction(tx);
    return this.web3Service
      .getClient()
      .eth.sendSignedTransaction(signedTx.rawTransaction);
  }
}
