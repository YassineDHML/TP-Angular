import {Component, OnInit, NgZone} from '@angular/core';
import {User, UsersService} from "../users.service";
import * as ChartJs from 'chart.js/auto';
@Component({
  selector: 'app-rh',
  templateUrl: './rh.component.html',
  styleUrls: ['./rh.component.css']
})
export class RhComponent implements OnInit {
  oddUsers: User[];
  evenUsers: User[];
  chart: any;
  
  constructor(private userService: UsersService, private ngZone: NgZone) {
    this.oddUsers = this.userService.getOddOrEven(true);
    this.evenUsers = this.userService.getOddOrEven();
  }

  ngOnInit(): void {
        this.createChart();
    }
  addUser(list: User[], newUser: string, type: 'odd' | 'even') {
    const newList = this.userService.addUser(list, newUser);
    if (type === 'odd') this.oddUsers = newList;
    else this.evenUsers = newList;
  }
  createChart(){
    const data = [
      { users: 'Workers', count: this.oddUsers.length },
      { users: 'Boss', count: this.evenUsers.length },
    ];
    this.ngZone.runOutsideAngular(() => { 
      this.chart = new ChartJs.Chart("MyChart",
      {
        type: 'bar',
          data: {
            labels: data.map(row => row.users),
          datasets: [
          {
            label: 'Entreprise stats',
            data: data.map(row => row.count)
          }
        ]
      }
      });
    });
  }
}
