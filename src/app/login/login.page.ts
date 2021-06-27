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
   this.platform.backButton.subscribeWithPriority(10, () => {
      this.backButtonAlert();
    })
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
      console.log(this.userLib);
      console.log(this.userLib.length);
      this.hideTab = true;
    })
  }

  get errorControl() {
    return this.loginForm.controls;
  }

  submitForm() {
    this.isSubmitted = true;
    if (!this.loginForm.valid) {
      console.log('Please provide all the required values!');
      return false;
    } else {
      console.log(this.loginForm.value.name)
      for(let i = 0; i < this.userLib.length; i++) {
        if(this.loginForm.value.name == this.userLib[i].name) {
          console.log("Nama ada");
          console.log(this.loginForm.value.password);
          console.log(this.userLib[i].password);
          if(this.loginForm.value.password == this.userLib[i].password) {
            console.log("password ada")
            localStorage.setItem('name',this.userLib[i].name);
            localStorage.setItem('roles',this.userLib[i].role);
            localStorage.setItem('imageUrl',this.userLib[i].imageUrl);
            this.loginForm.reset();
            this.router.navigate(['/profile']);
          } 
        }
      }
      this.passConf = false;
      return false;
      console.log("nama dan email tidak ada");
      //this.router.navigate(['/home']);
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
