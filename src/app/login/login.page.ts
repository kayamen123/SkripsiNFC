import { Component, OnInit } from '@angular/core';
import { RegisterServiceService } from '../service/register-service.service';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  userLib: any;
  loginForm: FormGroup;
  passConf = true;
  hideTab = false;
  isSubmitted = false;
  name: string = '';

  constructor(
    private rgsSrv: RegisterServiceService,
    public formBuilder: FormBuilder,
    public router: Router,
    private platform: Platform,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
    ) { }

  ngOnInit() {
    this.presentLoading();
    this.loginForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  ionViewDidEnter() {
   this.platform.backButton.subscribeWithPriority(15, () => {
      this.backButtonAlert();
    })
    this.hideTab = false;
    this.presentLoading();
    this.loginForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
    this.name = localStorage.getItem('name');
    (this.name);
    if(this.name != null) {
      ("Masuk Local");
      this.router.navigate(['/profile']);
    }
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });
    await loading.present();
    this.rgsSrv.getAllUserLibrary().snapshotChanges().pipe(
      map(changes =>
          changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    ).subscribe(data => {
      this.userLib = data;
      loading.dismiss();
      (this.userLib);
      (this.userLib.length);
      this.hideTab = true;
    })
  }

  get errorControl() {
    return this.loginForm.controls;
  }

  submitForm() {
    this.isSubmitted = true;
    if (!this.loginForm.valid) {
      ('Please provide all the required values!');
      return false;
    } else {
      (this.loginForm.value.name)
      for(let i = 0; i < this.userLib.length; i++) {
        if(this.loginForm.value.name == this.userLib[i].name) {
          ("Nama ada");
          (this.loginForm.value.password);
          (this.userLib[i].password);
          if(this.loginForm.value.password == this.userLib[i].password) {
            ("password ada")
            localStorage.setItem('name',this.userLib[i].name);
            localStorage.setItem('roles',this.userLib[i].role);
            localStorage.setItem('imageUrl',this.userLib[i].imageUrl);
            localStorage.setItem('phone',this.userLib[i].mobile_phone);
            localStorage.setItem('email',this.userLib[i].email);
            this.loginForm.reset();
            this.isSubmitted = false;
            this.router.navigate(['/profile']);
          } 
        }
      }
      this.passConf = false;
      return false;
    }
  }

  onChange() {
    this.passConf = true;
  }


  async backButtonAlert(){
    const alert = await this.alertCtrl.create({
       message: 'Do you want to exit?',
       buttons: [{
           text: 'Cancel',
           role: 'cancel'
       }, {
         text: 'Exit',
         handler: () => {
           navigator['app'].exitApp();
         }
       }]
    });
    
    await alert.present();
 } 
}
