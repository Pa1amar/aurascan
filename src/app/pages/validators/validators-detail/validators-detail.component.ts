import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockService } from '../../../../app/core/services/block.service';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { CommonService } from '../../../../app/core/services/common.service';
import { ValidatorService } from '../../../../app/core/services/validator.service';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { PageEvent } from '@angular/material/paginator';
import { Globals } from '../../../../app/global/global';
import { STATUS_VALIDATOR } from '../../../../app/core/constants/validator.enum';
import { NUMBER_CONVERT } from '../../../../app/core/constants/common.constant';

@Component({
  selector: 'app-validators-detail',
  templateUrl: './validators-detail.component.html',
  styleUrls: ['./validators-detail.component.scss'],
})
export class ValidatorsDetailComponent implements OnInit {
  breadCrumbItems = [{ label: 'Validators' }, { label: 'List', active: false }, { label: 'Detail', active: true }];

  currentAddress: string;
  currentValidatorDetail;

  lengthBlock: number;
  lengthDelegator: number;
  lengthPower: number;
  pageSize = 5;
  pageIndexBlock = 0;
  pageIndexDelegator = 0;
  pageIndexPower = 0;

  typeTransaction = TYPE_TRANSACTION;
  arrayUpTime = new Array(100);
  isUptimeMiss = true;
  statusValidator = STATUS_VALIDATOR;

  dataSourceBlock: MatTableDataSource<any>;
  templatesBlock: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'block_hash_format', headerCellDef: 'Block Hash' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumnsBlock: string[] = this.templatesBlock.map((dta) => dta.matColumnDef);

  dataSourceDelegator: MatTableDataSource<any>;
  templatesDelegator: Array<TableTemplate> = [
    { matColumnDef: 'delegator_address_format', headerCellDef: 'Delegator Address' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
  ];
  displayedColumnsDelegator: string[] = this.templatesDelegator.map((dta) => dta.matColumnDef);

  dataSourcePower: MatTableDataSource<any>;
  templatesPower: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'tx_hash_format', headerCellDef: 'TxHash' },
    { matColumnDef: 'fee', headerCellDef: 'Amount' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumnsPower: string[] = this.templatesPower.map((dta) => dta.matColumnDef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private validatorService: ValidatorService,
    private blockService: BlockService,
    public commonService: CommonService,
    public global: Globals,
  ) {}

  ngOnInit(): void {
    this.currentAddress = this.route.snapshot.paramMap.get('id');
    this.getDetail();
    this.getListBlockWithOperator();
    this.getListUpTime();
    this.getListDelegator();
    this.getListPower();
  }

  getDetail(): void {
    this.validatorService.validatorsDetail(this.currentAddress).subscribe(
      (res) => {
        if (res.status === 404) {
          this.router.navigate(['/']);
          return;
        }
        this.currentValidatorDetail = res.data;
        this.currentValidatorDetail.self_bonded = this.currentValidatorDetail.self_bonded / NUMBER_CONVERT;
        this.currentValidatorDetail.power = this.currentValidatorDetail.power / NUMBER_CONVERT;
        this.currentValidatorDetail.up_time =
          this.currentValidatorDetail.status === this.statusValidator.Active
            ? this.currentValidatorDetail.up_time
            : '0%';
      },
      (error) => {
        this.router.navigate(['/']);
      },
    );
  }

  getListBlockWithOperator(): void {
    this.blockService
      .blockWithOperator(this.pageSize, this.pageIndexBlock * this.pageSize, this.currentAddress)
      .subscribe((res) => {
        res.data.forEach((block) => {
          block.block_hash_format = block.block_hash.replace(
            block.block_hash.substring(6, block.block_hash.length - 6),
            '...',
          );
        });
        this.lengthBlock = res.meta?.count;
        this.dataSourceBlock = new MatTableDataSource(res.data);
      });
  }

  getListUpTime(): void {
    this.blockService.getLastBlock(this.currentAddress).subscribe((res) => {
      this.arrayUpTime = res.data;
    });
  }

  getListDelegator(): void {
    this.commonService
      .delegators(this.pageSize, this.pageIndexDelegator * this.pageSize, this.currentAddress)
      .subscribe((res) => {
        res.data.forEach((delegator) => {
          delegator.delegator_address_format = delegator.delegator_address.replace(
            delegator.delegator_address.substring(6, delegator.delegator_address.length - 6),
            '...',
          );
        });
        this.lengthDelegator = res.meta?.count;
        this.dataSourceDelegator = new MatTableDataSource(res.data);
      });
  }

  getListPower(): void {
    this.validatorService
      .validatorsDetailListPower(this.pageSize, this.pageIndexPower * this.pageSize, this.currentAddress)
      .subscribe((res) => {
        res.data.forEach((power) => {
          power.isStakeMode = false;
          if (power.type === 'delegate') {
            power.isStakeMode = true;
          }
          power.tx_hash_format = power.tx_hash.replace(power.tx_hash.substring(6, power.tx_hash.length - 6), '...');
        });
        this.dataSourcePower = new MatTableDataSource(res.data);
        this.lengthPower = res.meta?.count;
      });
  }

  changePage(page: PageEvent, type: string): void {
    switch (type) {
      case 'block':
        this.pageIndexBlock = page.pageIndex;
        this.getListBlockWithOperator();
        break;
      case 'delegator':
        this.pageIndexDelegator = page.pageIndex;
        this.getListDelegator();
        break;
      case 'power':
        this.pageIndexPower = page.pageIndex;
        this.getListPower();
        break;
      default:
        break;
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
}
