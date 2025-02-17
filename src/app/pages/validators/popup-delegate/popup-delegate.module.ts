import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { SimplebarAngularModule } from 'simplebar-angular';
import { CommonPipeModule } from '../../../core/pipes/common-pipe.module';
import { TableNoDataModule } from '../../../shared/components/table-no-data/table-no-data.module';
import { PopupDelegateComponent } from './popup-delegate.component';

@NgModule({
  declarations: [PopupDelegateComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    TranslateModule,
    CommonPipeModule,
    SimplebarAngularModule,
    RouterModule,
    TableNoDataModule,
    FormsModule,
    NgxMaskModule
  ],
  exports: [PopupDelegateComponent]
})
export class PopupDelegateModule { }
