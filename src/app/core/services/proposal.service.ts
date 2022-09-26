import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { INDEXER_URL } from '../constants/common.constant';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { IResponsesTemplates } from '../models/common.model';
import { IVotingInfo } from '../models/proposal.model';
import { CommonService } from './common.service';

@Injectable()
export class ProposalService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getVotes(proposalId: string | number, voter: string, limit: string | number, offset: string | number) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs?events=proposal_vote.proposal_id%3D%27${proposalId}%27&events=transfer.sender%3D%27${voter}%27&pagination.offset=${offset}&pagination.limit=${limit}&order_by=ORDER_BY_DESC`,
    );
  }

  getValidatorVotesFromIndexer(proposalid): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      proposalid: proposalid
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${INDEXER_URL}/votes/validators`, {
      params,
    });
  }

  getDepositors(proposalId: string | number) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs?events=proposal_deposit.proposal_id%3D%27${proposalId}%27&order_by=ORDER_BY_DESC`,
    );
  }

  getListVoteFromIndexer(payload, option): Observable<any> {
    let queryVote = 'proposal_vote.proposal_id=' + payload.proposalId + ';';
    if (option !== null) {
      queryVote =
        'proposal_vote.proposal_id=' +
        payload.proposalId +
        ';proposal_vote.option={"option":' +
        option +
        ',"weight":"1.000000000000000000"}';
    }
    const params = _({
      chainid: this.chainInfo.chainId,
      nextKey: payload.nextKey,
      reverse: false,
      query: queryVote,
      pageLimit: payload.pageLimit,
      countTotal: true
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${INDEXER_URL}/transaction`, {
      params,
    });
  }

  getStakeInfo(delegatorAddress: string): Observable<IResponsesTemplates<IVotingInfo>> {
    return this.http.get<IResponsesTemplates<IVotingInfo>>(`${this.apiUrl}/proposals/delegations/${delegatorAddress}`);
  }

  getProposalList(pageLimit = 20, nextKey = null, proposalId = null): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit: pageLimit,
      nextKey,
      reverse: false,
      proposalId: proposalId,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${INDEXER_URL}/proposal`, {
      params,
    });
  }
}
