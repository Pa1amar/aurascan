import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MenuItem} from "src/app/layouts/horizontaltopbar/menu.model";
import {MENU, MenuName} from "src/app/layouts/horizontaltopbar/menu";
import {Router} from "@angular/router";
import {NgbPopover} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-menu-bottom-bar',
  templateUrl: './menu-bottom-bar.component.html',
  styleUrls: ['./menu-bottom-bar.component.scss']
})
export class MenuBottomBarComponent implements OnInit {
  menu: MenuItem[] = MENU;
  menuName = MenuName;
  menuLink = [];
  overlayPanel = false;
  @ViewChild('popover') public popover: NgbPopover;

  constructor(public router: Router) { }

  ngOnInit(): void {
    for(let menu of this.menu){
      if(!menu.subItems) {
        this.menuLink.push(menu.link)
      } else {
        let arr = [];
        for(let subMenu of menu.subItems) {
          arr.push(subMenu.link)
        }
        this.menuLink.push(arr)
      }
    }
  }

  @HostListener('body:click', ['$event'])
  mouseleave(event) {
    const ids = ['blockChainBtn', 'tokenBtn', 'resourceBtn', 'moreBtn',
      'blockChainIcon', 'blockChainText', 'resourceIcon', 'resourceText',
      'tokenIcon', 'tokenText', 'moreIcon', 'moreText'];
    const id= event.target?.id;
    if(this.popover.isOpen()) {
      if(ids.indexOf(id) < 0){
        document.getElementById('popover-overlay').click();
      }
    }
  }

  overLayClickEvent() {
    this.overlayPanel = false;
  }

}
