import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatisticsRoutingModule } from './statistics-routing.module';
import { ChartStatsComponent } from './chart-stats/chart-stats.component';
import { TopStatisticsComponent } from './top-statistics/top-statistics.component';
import { ChartDetailComponent } from './chart-detail/chart-detail.component';
import {SharedModule} from "src/app/shared/shared.module";


@NgModule({
  declarations: [
    ChartStatsComponent,
    TopStatisticsComponent,
    ChartDetailComponent
  ],
    imports: [
        CommonModule,
        StatisticsRoutingModule,
        SharedModule
    ]
})
export class StatisticsModule { }
