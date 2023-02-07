import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'src/app/layouts/horizontaltopbar/menu.model';
import { MENU, MENU_MOB, MenuName } from 'src/app/layouts/horizontaltopbar/menu';
import { Router } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-menu-bottom-bar',
  templateUrl: './menu-bottom-bar.component.html',
  styleUrls: ['./menu-bottom-bar.component.scss'],
})
export class MenuBottomBarComponent implements OnInit {
  menu: MenuItem[] = MENU_MOB;
  menuName = MenuName;
  menuLink = [];
  overlayPanel = false;
  wallet = null;
  @ViewChild('popover') public popover: NgbPopover;

  constructor(public router: Router, private walletService: WalletService) {}

  ngOnInit(): void {
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.wallet = wallet;
      }
    });

    for (let menu of this.menu) {
      if (!menu.subItems) {
        this.menuLink.push(menu.link);
      } else {
        let arr = '';
        for (let subMenu of menu.subItems) {
          arr += subMenu.link;
        }
        this.menuLink.push(arr);
      }
    }
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
      // or
      return true;
    };
  }

  @HostListener('body:click', ['$event'])
  mouseleave(event) {
    const ids = [
      'blockChainBtn',
      'tokenBtn',
      'resourceBtn',
      'moreBtn',
      'blockChainIcon',
      'blockChainText',
      'resourceIcon',
      'resourceText',
      'tokenIcon',
      'tokenText',
      'moreIcon',
      'moreText',
    ];
    const id = event.target?.id;
    if (this.popover.isOpen()) {
      if (ids.indexOf(id) < 0) {
        const overlay = document.getElementById('popover-overlay');
        if (overlay) {
          overlay.click();
        }
      }
    }
  }

  overLayClickEvent() {
    this.overlayPanel = false;
  }

  checkMenuActive(menuLink: string) {
    if ((this.router.url === '/' || this.router.url === '/dashboard') && menuLink === '/dashboard') {
      return true;
    }

    if (!menuLink.includes('/tokens')) {
      if (menuLink === '/' + this.router.url.split('/')[1] && this.router.url.includes(menuLink)) {
        return true;
      }
    }

    if (menuLink === '/tokens' && (this.router.url == '/tokens' || this.router.url.includes('/tokens/token/'))) {
      return true;
    }

    if (
      menuLink === '/tokens/tokens-nft' &&
      (this.router.url == '/tokens/tokens-nft' || this.router.url.includes('/tokens/token-nft'))
    ) {
      return true;
    }

    if (
      menuLink === '/tokens/token-abt' &&
      (this.router.url == '/tokens/token-abt' || this.router.url.includes('/tokens/token-abt'))
    ) {
      return true;
    }

    if (
      menuLink === '/statistics/charts-stats' &&
      (this.router.url == '/statistics/charts-stats' || this.router.url.includes('/statistics/chart/'))
    ) {
      return true;
    }

    if (menuLink === '/statistics/top-statistic' && this.router.url == '/statistics/top-statistic') {
      return true;
    }
    return false;
  }
}
