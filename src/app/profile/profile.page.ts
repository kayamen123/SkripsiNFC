import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  name: string;
  role: string;
  status = false;
  constructor() { }

  ngOnInit() {
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('roles');
    console.log("Name :",this.name);
    console.log("Role :",this.role);
    if(this.role == 'admin'){
      this.status = true;
    }
  }

}
