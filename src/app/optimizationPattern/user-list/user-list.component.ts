import { 
  Component, Input, Output, EventEmitter, 
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { User } from "../users.service";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  // stratégie OnPush
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class UserListComponent {
  @Input() usersCluster: string = '';
  @Input() users: User[] = [];
  @Output() add = new EventEmitter<string>();
  
  userFullName: string = '';

  constructor(private cdr: ChangeDetectorRef) {
      // Pour info: Si on voulait faire du "Out of Bound" extrême, on ferait:
      // this.cdr.detach(); 
      // Et on appellerait this.cdr.detectChanges() uniquement quand nécessaire.
      // Avec OnPush, c'est géré automatiquement via les Inputs.
  }

  addUser() {
    this.add.emit(this.userFullName);
    this.userFullName = ''; 
    // Avec OnPush, ceci mettra à jour la vue car c'est un événement DOM interne
  }
}