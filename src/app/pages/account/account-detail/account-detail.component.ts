import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartComponent } from 'ng-apexcharts';
import local from '../../../../app/core/utils/storage/local';
import { WalletService } from '../../../../app/core/services/wallet.service';
import { ACCOUNT_WALLET_COLOR, TYPE_ACCOUNT } from '../../../core/constants/account.constant';
import {
  ACCOUNT_TYPE_ENUM,
  ACCOUNT_WALLET_COLOR_ENUM,
  PageEventType,
  WalletAcount,
} from '../../../core/constants/account.enum';
import { PAGE_EVENT } from '../../../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction, TypeTransaction } from '../../../core/constants/transaction.enum';
import { IAccountDetail } from '../../../core/models/account.model';
import { ResponseDto, TableTemplate } from '../../../core/models/common.model';
import { AccountService } from '../../../core/services/account.service';
import { CommonService } from '../../../core/services/common.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { getAmount, Globals } from '../../../global/global';
import { chartCustomOptions, ChartOptions, CHART_OPTION } from './chart-options';
import { Subject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DecimalPipe } from '@angular/common';
import { balanceOf } from '../../../../app/core/utils/common/parsing';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('assetTypeSelect') assetTypeSelect: MatSelect;
  @HostListener('window:scroll', ['$event'])
  closeOptionPanelSection(_) {
    if (this.assetTypeSelect !== undefined) {
      this.assetTypeSelect.close();
    }
  }
  public chartOptions: Partial<ChartOptions>;

  @ViewChild('walletChart') chart: ChartComponent;
  @ViewChild(MatSort) sort: MatSort;

  currentAddress: string;

  currentAccountDetail: IAccountDetail;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash_format', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];

  templatesToken: Array<TableTemplate> = [
    { matColumnDef: 'token_name', headerCellDef: 'Name' },
    { matColumnDef: 'token_amount', headerCellDef: 'Amount' },
    { matColumnDef: 'total_value', headerCellDef: 'Total Value' },
  ];
  displayedColumnsToken: string[] = this.templatesToken.map((dta) => dta.matColumnDef);
  dataSourceToken: MatTableDataSource<any>;
  dataSourceTokenBk: MatTableDataSource<any>;

  templatesDelegation: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Validator' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'reward', headerCellDef: 'Reward' },
  ];
  displayedColumnsDelegation: string[] = this.templatesDelegation.map((dta) => dta.matColumnDef);
  dataSourceDelegation: MatTableDataSource<any>;

  templatesUnBonding: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Validator' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'completion_time', headerCellDef: 'Completion Time' },
  ];
  displayedColumnsUnBonding: string[] = this.templatesUnBonding.map((dta) => dta.matColumnDef);
  dataSourceUnBonding: MatTableDataSource<any>;

  templatesReDelegation: Array<TableTemplate> = [
    { matColumnDef: 'validator_src_name', headerCellDef: 'From' },
    { matColumnDef: 'validator_dst_name', headerCellDef: 'To' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'completion_time', headerCellDef: 'Time' },
  ];
  displayedColumnsReDelegation: string[] = this.templatesReDelegation.map((dta) => dta.matColumnDef);
  dataSourceReDelegation: MatTableDataSource<any>;

  templatesVesting: Array<TableTemplate> = [
    { matColumnDef: 'type_format', headerCellDef: 'Type' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'vesting_schedule', headerCellDef: 'Vesting Schedule' },
  ];
  displayedColumnsVesting: string[] = this.templatesVesting.map((dta) => dta.matColumnDef);
  dataSourceVesting: MatTableDataSource<any>;
  pageType = '';

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataToken: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataDelegation: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataUnbonding: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataRedelegation: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataVesting: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  length: number;
  pageSize = 5;
  pageIndex = 0;
  typeTransaction = TYPE_TRANSACTION;
  statusTransaction = StatusTransaction;
  pageEventType = PageEventType;
  imgGenerateQR: boolean;
  assetsType = TYPE_ACCOUNT;
  isCopy = false;
  tokenPrice = 0;
  selected = ACCOUNT_TYPE_ENUM.All;
  searchNullData = false;
  chartCustomOptions = chartCustomOptions;

  // loading param check
  accDetailLoading = true;
  chartLoading = true;
  userAddress = '';
  lstBalanceAcount = undefined;
  modalReference: any;

  destroyed$ = new Subject();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));

  constructor(
    private transactionService: TransactionService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    public global: Globals,
    private walletService: WalletService,
    private layout: BreakpointObserver,
    private modalService: NgbModal,
    private numberPipe: DecimalPipe
  ) {
    this.chartOptions = CHART_OPTION();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.chartCustomOptions = [...ACCOUNT_WALLET_COLOR];
    this.route.params.subscribe((params) => {
      if (params?.id) {
        this.currentAddress = params?.id;
        this.loadDataTemp();
        this.getAccountDetail();
        this.getListTransaction();
      }
    });
  }

  loadDataTemp(): void {
    //get data from client for my account
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
      }
    });

    let retrievedObject = localStorage.getItem('accountDetail');
    if (retrievedObject) {
      let data = JSON.parse(retrievedObject);
      let dataAccount = JSON.parse(data?.dataAccount);
      if (dataAccount && dataAccount.acc_address === this.currentAddress) {
        this.accDetailLoading = false;
        this.chartLoading = false;
        this.currentAccountDetail = dataAccount;
        this.dataSourceToken = new MatTableDataSource(dataAccount.balances);
        this.pageDataToken.length = dataAccount.balances.length;

        // this.dataSourceDelegation = new MatTableDataSource(dataAccount.delegations);
        // this.pageDataDelegation.length = dataAccount.delegations.length;

        // this.dataSourceUnBonding = new MatTableDataSource(dataAccount.unbonding_delegations);
        // this.pageDataUnbonding.length = dataAccount.unbonding_delegations.length;

        // this.dataSourceReDelegation = new MatTableDataSource(dataAccount.redelegations);
        // this.pageDataRedelegation.length = dataAccount.redelegations.length;

        this.chartOptions = JSON.parse(data?.dataChart);
      }
    }
  }

  copyMessage(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.isCopy = true;
    setTimeout(() => {
      this.isCopy = false;
    }, 1000);
  }

  changePage(page: any): void {
    switch (page.pageEventType) {
      case this.pageEventType.Delegation:
        this.pageDataDelegation.pageIndex = page.pageIndex;
        this.getListTransaction();
        break;
      case this.pageEventType.Unbonding:
        this.pageDataUnbonding.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Redelegation:
        this.pageDataRedelegation.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Vestings:
        this.pageDataVesting.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Token:
        this.pageDataToken.pageIndex = page.pageIndex;
        break;
      default:
        this.pageData.pageIndex = page.pageIndex;
        this.getListTransaction();
        break;
    }
  }

  getListTransaction(): void {
    this.transactionService
      .txsWithAddress(this.pageSize, this.pageData.pageIndex * this.pageSize, this.currentAddress)
      .subscribe((res: ResponseDto) => {
        if (res?.data?.length > 0) {
          res.data.forEach((trans) => {
            //get amount of transaction
            trans.amount = getAmount(trans.messages, trans.type, trans.raw_log);
            const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === trans.type.toLowerCase());
            trans.type = typeTrans?.value;
            trans.status = StatusTransaction.Fail;
            if (trans.code === CodeTransaction.Success) {
              trans.status = StatusTransaction.Success;
            }
            if (trans.type === TypeTransaction.Send && trans?.messages[0]?.from_address !== this.currentAddress) {
              trans.type = TypeTransaction.Received;
            }
            trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
          });
          this.dataSource.data = res.data;

          this.length = res.meta.count;
          this.pageData.length = res.meta.count;
        }
      });
  }

  getAccountDetail(): void {
    this.accountService.getAccountDetail(this.currentAddress).subscribe((res) => {
      this.chartLoading = true;
      this.accDetailLoading = true;
      if (res?.data) {
        this.currentAccountDetail = res.data;
        this.chartOptions.series = [];
        if (+this.currentAccountDetail.commission > 0) {
          this.chartOptions.labels.push(ACCOUNT_WALLET_COLOR_ENUM.Commission);
          this.chartOptions.colors.push(WalletAcount.Commission);
          this.chartCustomOptions.push({
            name: ACCOUNT_WALLET_COLOR_ENUM.Commission,
            color: WalletAcount.Commission,
            amount: '0.000000',
          });
        }

        this.chartCustomOptions.forEach((f) => {
          switch (f.name) {
            case ACCOUNT_WALLET_COLOR_ENUM.Available:
              f.amount = this.currentAccountDetail.available;
              break;
            case ACCOUNT_WALLET_COLOR_ENUM.Delegated:
              f.amount = this.currentAccountDetail.delegated;
              break;
            case ACCOUNT_WALLET_COLOR_ENUM.StakingReward:
              f.amount = this.currentAccountDetail.stake_reward;
              break;
            case ACCOUNT_WALLET_COLOR_ENUM.Commission:
              f.amount = this.currentAccountDetail.commission;
              break;
            case ACCOUNT_WALLET_COLOR_ENUM.Unbonding:
              f.amount = this.currentAccountDetail.unbonding;
              break;
            case ACCOUNT_WALLET_COLOR_ENUM.DelegatableVesting:
              f.amount = this.currentAccountDetail.vesting?.amount;
              break;
            default:
              break;
          }
          f.amount = f.amount || '0';
          this.chartOptions.series.push(Number(f.amount));
        });

        this.currentAccountDetail.balances.forEach((token) => {
          token.price = 0;
          if (token.name === this.global.stableToken) {
            token.amount = this.currentAccountDetail.total;
          }
          token.total_value = token.price * Number(token.amount);
        });
        this.tokenPrice = 0;

        this.currentAccountDetail?.balances.forEach((f) => {
          f.token_amount = f.amount;
          f.token_name = f.name;
        });

        this.lstBalanceAcount = this.currentAccountDetail?.balances;
        this.dataSourceToken = new MatTableDataSource(this.currentAccountDetail?.balances);
        this.pageDataToken.length = this.currentAccountDetail?.balances.length;
        this.dataSourceTokenBk = this.dataSourceToken;

        this.dataSourceDelegation = new MatTableDataSource(this.currentAccountDetail?.delegations);
        this.pageDataDelegation.length = this.currentAccountDetail?.delegations.length;

        this.dataSourceUnBonding = new MatTableDataSource(this.currentAccountDetail?.unbonding_delegations);
        this.pageDataUnbonding.length = this.currentAccountDetail?.unbonding_delegations.length;

        this.dataSourceReDelegation = new MatTableDataSource(this.currentAccountDetail?.redelegations);
        this.pageDataRedelegation.length = this.currentAccountDetail?.redelegations.length;

        if (this.currentAccountDetail?.vesting) {
          this.dataSourceVesting = new MatTableDataSource([this.currentAccountDetail?.vesting]);
          this.pageDataVesting.length = 1;
        }
        this.accDetailLoading = false;
        this.chartLoading = false;

        if (this.userAddress === this.currentAddress) {
          local.removeItem('accountDetail');
          //store data wallet info
          let accountDetail = {};
          accountDetail['dataAccount'] = JSON.stringify(this.currentAccountDetail);
          accountDetail['dataChart'] = JSON.stringify(this.chartOptions);
          local.setItem('accountDetail', accountDetail);
        }
      }
    });
  }

  searchToken(): void {
    this.searchNullData = false;
    if (this.textSearch.length > 0) {
      const data = this.dataSourceTokenBk.data.filter(
        (f) => f.name.toLowerCase().indexOf(this.textSearch.toLowerCase().trim()) > -1,
      );
      if (data && data.length === 0) {
        this.searchNullData = true;
      }
      this.dataSourceToken = this.dataSourceTokenBk;
      this.lstBalanceAcount = data;
      this.dataSourceToken = new MatTableDataSource(data);
    } else {
      this.dataSourceToken = this.dataSourceTokenBk;
    }
  }

  openTxsDetail(event: any, data: any) {
    const linkHash = event?.target.classList.contains('hash-link');
    const linkBlock = event?.target.classList.contains('block-link');
    if (linkHash) {
      this.router.navigate(['transaction', data.tx_hash]);
    } else if (linkBlock) {
      this.router.navigate(['blocks/id', data.blockId]);
    }
  }

  paginatorEmit(e): void {
    this.dataSource.paginator = e;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListTransaction();
  }

  viewQrAddress(staticDataModal: any): void {
    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      windowClass: 'modal-holder',
    });
  }

  closePopup() {
    this.modalReference.close();
  }

  checkAmountValue(message: any[], txHash: string) {
    if(message.length > 1) {
      return `<a class="text--primary" [routerLink]="['/transaction', ` + txHash + `]">More</a>`;
    } else if(message.length === 0 || (message.length === 1 && !message[0].amount)){
      return '-';
    } else {
      return this.numberPipe.transform(balanceOf(message[0].amount.amount), this.global.formatNumberToken) + '<span class=text--primary> AURA </span>';
    }
  }
}
