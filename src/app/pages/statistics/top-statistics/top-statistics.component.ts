import { Component, OnInit } from '@angular/core';
import {TABS_TITLE_TOP_STATISTICS} from "src/app/core/constants/chart.constant";
import { StatisticService } from 'src/app/core/services/statistic.service';

@Component({
  selector: 'app-top-statistics',
  templateUrl: './top-statistics.component.html',
  styleUrls: ['./top-statistics.component.scss']
})
export class TopStatisticsComponent implements OnInit {
  TABS = TABS_TITLE_TOP_STATISTICS;
  currentTab = TABS_TITLE_TOP_STATISTICS[0].label;
  loading = true;
  constructor(private statisticService: StatisticService) { }

  ngOnInit(): void {
    this.getDataStatis();
  }

  getDataStatis(){
    let dayRange = 1;
    let limit = 1;
    this.statisticService.getListStatistic(dayRange, limit).subscribe((res) => {
      console.log(res);
      this.loading = false;
    });
  }

}
