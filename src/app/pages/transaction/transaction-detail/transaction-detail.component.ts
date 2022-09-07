import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TYPE_TRANSACTION } from '../../../core/constants/transaction.constant';
import { CodeTransaction } from '../../../core/constants/transaction.enum';
import { CommonService } from '../../../core/services/common.service';
import { MappingErrorService } from '../../../core/services/mapping-error.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { convertDataTransaction, Globals } from '../../../global/global';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
})
export class TransactionDetailComponent implements OnInit {
  txHash = '';
  transaction = null;
  codeTransaction = CodeTransaction;
  typeTransaction = TYPE_TRANSACTION;
  isRawData = false;
  errorMessage = '';

  TAB = [
    {
      id: 0,
      value: 'SUMMARY',
    },
    {
      id: 1,
      value: 'JSON',
    },
  ];
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  chainId = this.environmentService.configValue.chainId;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinDecimals = this.environmentService.configValue.chain_info.currencies[0].coinDecimals;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    public global: Globals,
    public commonService: CommonService,
    private mappingErrorService: MappingErrorService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.txHash = this.route.snapshot.paramMap.get('id');
    if (!this.txHash || this.txHash === 'null') {
      this.router.navigate(['/']);
    }
    this.getDetail();
  }

  getDetail(): void {
    this.transactionService.txsIndexer(1, 0, this.txHash).subscribe(
      (res) => {
        const { code, data } = res;
        if (code === 200) {
          const txs = convertDataTransaction(data, this.coinDecimals, this.coinMinimalDenom);
          this.transaction = txs[0];
          this.transaction = {
            ...this.transaction,
            chainid: this.chainId,
            gas_used: _.get(res?.data.transactions[0], 'tx_response.gas_used'),
            gas_wanted: _.get(res?.data.transactions[0], 'tx_response.gas_wanted'),
            raw_log: _.get(res?.data.transactions[0], 'tx_response.raw_log'),
            type: _.get(res?.data.transactions[0], 'tx.body.messages[0].@type'),
            tx: _.get(res?.data.transactions[0], 'tx_response'),
          };
          
          if (this.transaction.raw_log && +this.transaction.code !== CodeTransaction.Success) {
            this.errorMessage = this.transaction.raw_log;
            this.errorMessage = this.mappingErrorService.checkMappingError(this.errorMessage, this.transaction.code);
          }
        }
      },
      (_) => {
        this.router.navigate(['/']);
      },
    );
  }

  changeType(type: boolean): void {
    this.isRawData = type;
  }
}
