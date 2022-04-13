import { Injectable } from '@angular/core';
import { NUMBER_CONVERT } from '../core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM, TypeTransaction } from '../core/constants/transaction.enum';
import { CommonDataDto } from '../core/models/common.model';

Injectable()

export class Globals {
  dataHeader = new CommonDataDto();
  stableToken = 'AURA';
  formatNumberToken = '1.6-6';
  formatNumber2Decimal = '1.2-2';
}

export function getAmount(arrayMsg, type, rawRog = '') {
  let amount = 0;
  let amountFormat;
  let eTransType = TRANSACTION_TYPE_ENUM;
  let itemMessage = arrayMsg[0];
  
  if (itemMessage?.amount && (type === eTransType.Undelegate 
    || type === eTransType.Delegate)) {
    amount = itemMessage?.amount.amount;
  } else if (itemMessage?.amount) {
    amount = itemMessage?.amount[0].amount;
  } else if (itemMessage?.funds && itemMessage?.funds.length > 0) {
    amount = itemMessage?.funds[0].amount;
  } else if (type === eTransType.SubmitProposalTx){
    amount = itemMessage?.initial_deposit[0]?.amount || 0;
  } else if (type === TRANSACTION_TYPE_ENUM.GetReward){
    const jsonData = JSON.parse(rawRog)
    amount = jsonData[0].events[0].attributes[1].value.replace('uaura','');
  }

  if (itemMessage && amount >= 0) {
    amount = (amount / NUMBER_CONVERT) || 0;
    amountFormat = arrayMsg.length === 1 ? amount : 'More';
  }

  return amountFormat;
}