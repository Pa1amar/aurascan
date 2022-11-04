import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import io, { Socket } from 'socket.io-client';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';

interface RedisResponse {
  Code: string;
  Message: string;
  ContractAddress: string;
  Verified: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class WSService {
  socketUrl = `${this.environmentService.configValue.urlSocket}`;

  public wsData: BehaviorSubject<any>;
  public data$: Observable<any>;

  socket: Socket;

  registered = false;

  contractAddress = '';

  constructor(private environmentService: EnvironmentService, private toastr: NgxToastrService) {
    this.wsData = new BehaviorSubject<any>(null);
    this.data$ = this.wsData.asObservable();
  }

  public get wsDataValue() {
    return this.wsData.value;
  }

  public connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.socketUrl, {
      path: '/socket.io',
      autoConnect: true,
    });
  }

  public on(name: string, data: any): Observable<any> | undefined {
    if (!this.registered) {
      this.socket.emit(name, data);

      this.registered = true;

      return new Observable((subscriber) => {
        this.socket.on(name, () => {
          this.socket.on(data?.event, (res) => {
            subscriber.next(res);
          });
        });
      });
    }

    return undefined;
  }

  public disconnect() {
    this.registered = false;
    this.socket?.on('disconnect', (reason) => {
      // ...
      console.log('reason disconnect', reason);
    });
  }

  public reconnect() {
    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        this.socket.connect();
      }
      // else the socket will automatically try to reconnect
    });
  }

  subscribeVerifyContract(contractAdr: string, callBack?: () => void, tabCallBack?: () => void) {
    this.connect();

    this.contractAddress = `${contractAdr}`;

    const wsData = { event: 'eventVerifyContract' };

    const register = this.on('register', wsData);

    if (register === undefined) {
      return;
    }

    register.subscribe((data: any) => {
      let resMessages = '';
      const redisResponse: RedisResponse = (data && JSON.parse(data)) || {
        Code: '',
        Message: '',
        Verified: false,
        ContractAddress: null,
      };
      if (redisResponse.ContractAddress === this.contractAddress && this.contractAddress) {
        callBack && callBack();
        if (redisResponse.Verified) {
          this.toastr
            .successWithTap('Contract Source Code Verification is successful! Click here to view detail')
            .pipe(take(1))
            .subscribe((_) => {
              tabCallBack && tabCallBack();
            });
        } else {
          switch (redisResponse.Code) {
            case 'E001':
              resMessages = 'Smart contract source code or compiler version is incorrect';
              break;
            case 'E002':
              resMessages = 'Provided wasm file is incorrect';
              break;
            case 'E003':
              resMessages = 'Internal error';
              break;
            case 'E008':
              resMessages = 'Contract git URL not found';
              break;
            case 'E009':
              resMessages = 'Commit not found';
              break;
            default:
              resMessages = `Error! Unable to generate Contract Creation Code and Schema for Contract ${redisResponse.ContractAddress}`;
              break;
          }
          this.toastr
            .errorWithTap(resMessages)
            .pipe(take(1))
            .subscribe((_) => {
              tabCallBack && tabCallBack();
            });
        }
        this.contractAddress = null;
      }
    });
  }
}
