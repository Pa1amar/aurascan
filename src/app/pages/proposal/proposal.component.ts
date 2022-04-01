import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ResponseDto, TableTemplate} from "../../core/models/common.model";
import {PageEvent} from "@angular/material/paginator";
import {ProposalService} from "../../core/services/proposal.service";
import {MatSort} from "@angular/material/sort";
import { PROPOSAL_STATUS, PROPOSAL_VOTE } from 'src/app/core/constants/status.constant';
import {MatDialog} from "@angular/material/dialog";
import {ProposalVoteComponent} from "./proposal-vote/proposal-vote.component";
import { DatePipe } from '@angular/common';
import { DATEFORMAT } from '../../core/constants/common.constant';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss']
})
export class ProposalComponent implements OnInit {
  statusConstant = PROPOSAL_STATUS;
  voteConstant = PROPOSAL_VOTE;
  voteAvailable = true;
  voteValue: {keyVote: number} = null;
  @ViewChild(MatSort) sort: MatSort;
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  // data table
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'ID' },
    { matColumnDef: 'title', headerCellDef: 'Title' },
    { matColumnDef: 'status', headerCellDef: 'Status' },
    { matColumnDef: 'votingStart', headerCellDef: 'Voting Start' },
    { matColumnDef: 'submitTime', headerCellDef: 'Submit Time' },
    { matColumnDef: 'totalDeposit', headerCellDef: 'Total Deposit' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 20;
  pageIndex = 0;
  lastedList = [];

  constructor(
      private proposalService: ProposalService,
      public dialog: MatDialog,
      private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Proposal' },
      { label: 'List', active: true }
    ];
    this.getList();
  }

  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.proposalService
        .getProposal(this.pageSize, this.pageIndex)
        .subscribe((res: ResponseDto) => {
          this.dataSource = new MatTableDataSource<any>(res.data);
          this.length = res.data.length;
          this.dataSource.sort = this.sort;
          this.lastedList = res.data;
          this.lastedList.forEach((pro)=>{
            const totalVoteYes = pro.pro_votes_yes;
            const totalVoteNo = pro.pro_votes_no;
            const totalVoteNoWithVeto = pro.pro_votes_no_with_veto;
            const totalVoteAbstain = pro.pro_votes_abstain;
            const totalVote = totalVoteYes + totalVoteNo + totalVoteNoWithVeto + totalVoteAbstain;
            pro.pro_votes_yes = totalVoteYes*100/totalVote;
            pro.pro_votes_no = totalVoteNo*100/totalVote;
            pro.pro_votes_no_with_veto = totalVoteNoWithVeto*100/totalVote;
            pro.pro_votes_abstain = totalVoteAbstain*100/totalVote;

            pro.pro_voting_start_time = this.datePipe.transform(pro.pro_voting_start_time, DATEFORMAT.DATETIME_UTC);
            pro.pro_voting_end_time = this.datePipe.transform(pro.pro_voting_end_time, DATEFORMAT.DATETIME_UTC);
            pro.pro_submit_time = this.datePipe.transform(pro.pro_submit_time, DATEFORMAT.DATETIME_UTC);
            let abc = this.getHighestVote(totalVoteYes, totalVoteNo, totalVoteNoWithVeto, totalVoteAbstain);
            console.log(abc);
            
          })
        })
    // this.proposalService
    //     .getLastedProposal()
    //     .subscribe(res => {
    //       this.lastedList = res
    //     })
  }

  getStatus(key: string) {
    let resObj: {value: string, class: string} = null;
    const statusObj = this.statusConstant.find(s => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: statusObj.value,
        class: statusObj.class
      }
    }
    return resObj;
  }

  getHighestVote(yes: number, no: number, noWithVeto: number, abstain: number) {
    const highest = Math.max(yes, no, noWithVeto, abstain);
    let key;
    let resObj: {value: number, name: string, class: string} = null;
    if(highest === yes)
    {
      key = 0;
    }
    else if (highest === no)
    {
      key = 1;
    }
    else if (highest === noWithVeto)
    {
      key = 2;
    }
    else
    {
      key = 3;
    }
    const statusObj = this.voteConstant.find(s => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: Math.round(highest),
        class: statusObj.class,
        name: statusObj.value
      }
    }
    return resObj;
  }

  filterGetHighestVote(voteResult: {yes: number, no: number, noWithVeto: number, abstain: number}) {
    let Sorted = Object.entries(voteResult).sort((prev, next) => prev[1] - next[1])
    return Sorted[3];
  }

  openVoteDialog(id: string, title: string) {
    let dialogRef = this.dialog.open(ProposalVoteComponent, {
      height: '400px',
      width: '600px',
      data: {id, title, voteValue: this.voteValue},
    });
    dialogRef.afterClosed().subscribe(result => {
      this.voteValue = result;
    });
  }
}
