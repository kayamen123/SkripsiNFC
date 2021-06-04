import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { RegisterServiceService } from '../service/register-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isSubmitted = false;
  passConf = true;
  constructor(
    public formBuilder: FormBuilder,
    public rgsSrv: RegisterServiceService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      role: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      password: ['',[Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  get errorControl() {
    return this.registerForm.controls;
  }

  submitForm() {
    this.isSubmitted = true;
    console.log(this.registerForm.get('password').value);
    console.log(this.registerForm.get('password_confirmation').value);
      if (!this.registerForm.valid || this.registerForm.get('password').value != this.registerForm.get('password_confirmation').value) {
        console.log('Please provide all the required values!')
        this.passConf = false;
        return false;
      } else {
        this.presentLoading().then(() => {
        this.registerForm.removeControl('password_confirmation');
        console.log(this.registerForm.value)
        this.passConf = true;
        this.rgsSrv.createUserLibrary(this.registerForm.value).then(res => {
          console.log(res);
          this.router.navigate(['/login']);
        }).catch(error => console.log(error));
        
        this.registerForm.reset();
        this.router.navigate(['/login']);
      });
    }
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      duration: 2000
    });

    await loading.present();

    const{role, data} = await loading.onDidDismiss();
  }

  onChange() {
    this.passConf = true;
  }

}
