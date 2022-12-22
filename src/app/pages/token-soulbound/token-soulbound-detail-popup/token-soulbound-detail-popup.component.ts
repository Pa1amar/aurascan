import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MESSAGES_CODE, MESSAGES_CODE_CONTRACT } from 'src/app/core/constants/messages.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { getKeplr } from 'src/app/core/utils/keplr';

@Component({
  selector: 'app-token-soulbound-detail-popup',
  templateUrl: './token-soulbound-detail-popup.component.html',
  styleUrls: ['./token-soulbound-detail-popup.component.scss'],
})
export class TokenSoulboundDetailPopupComponent implements OnInit {
  isError = false;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  network = this.environmentService.configValue.chain_info;
  currentAddress = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public soulboundDetail: any,
    public dialogRef: MatDialogRef<TokenSoulboundDetailPopupComponent>,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    public translate: TranslateService,
  ) {}

  ngOnInit(): void {}

  error(): void {
    this.isError = true;
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }

  async equipSB() {
    this.currentAddress = this.walletService.wallet?.bech32Address;
    const keplr = await getKeplr();
    let dataKeplr = await keplr.signArbitrary(this.network.chainId, this.currentAddress, this.soulboundDetail.token_id);

    const payload = {
      signature: dataKeplr.signature,
      msg: this.soulboundDetail.token_id,
      pubKey: dataKeplr.pub_key.value,
      id: this.soulboundDetail.token_id,
      status: this.soulboundDetail.status,
    };

    if (this.currentAddress) {
      const msgExecute = {
        take: {
          from: 'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
          uri: this.soulboundDetail.token_uri,
          signature: {
            hrp: 'aura',
            pub_key: dataKeplr.pub_key.value,
            signature: dataKeplr.signature,
          },
        },
      };
    }

    // this.soulboundService.updatePickSBToken(payload).subscribe((res) => {
    //   if (res?.code) {
    //     let msgError = res?.message.toString() || 'Error';
    //     this.toastr.error(msgError);
    //   } else {
    //     this.toastr.success(MESSAGES_CODE.SUCCESSFUL.Message);
    //     this.dialogRef.close();
    //   }
    //   // this.getListSB();
    // });
  }

  execute(data) {
    let msgError = MESSAGES_CODE_CONTRACT[5].Message;
    msgError = msgError ? msgError.charAt(0).toUpperCase() + msgError.slice(1) : 'Error';
    try {
      this.walletService
        .execute(this.currentAddress, this.soulboundDetail.contract_address, data)
        .then((e) => {
          // msg.isLoading = false;
          if ((e as any).result?.error) {
            this.toastr.error(msgError);
          } else {
            if ((e as any)?.transactionHash) {
              this.toastr.loading((e as any)?.transactionHash);
              setTimeout(() => {
                this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
              }, 4000);
            }
          }
        })
        .catch((error) => {
          // msg.isLoading = false;
          if (!error.toString().includes('Request rejected')) {
            this.toastr.error(msgError);
          }
        });
    } catch (error) {
      this.toastr.error(`Error: ${msgError}`);
    }
  }
}
