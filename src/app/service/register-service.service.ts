import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { BookLibrary } from '../model/bookLibrary';
import { UserLibrary } from '../model/userLibrary';
import { BorrowLibrary } from '../model/borrowLibrary';

@Injectable({
  providedIn: 'root'
})
export class RegisterServiceService {

  private dbPath = '/userlibrary';
  private dbPath2 = '/booklibrary';
  userLibraryRef: AngularFireList<UserLibrary> = null;
  bookLibraryRef: AngularFireList<BookLibrary> = null;
  borrowLibraryRef: AngularFireList<BorrowLibrary> = null;

  constructor(private db: AngularFireDatabase) { 
    this.userLibraryRef = db.list(this.dbPath);
    this.bookLibraryRef = db.list(this.dbPath2);
  }

  getAllUserLibrary(): AngularFireList<UserLibrary> {
    return this.userLibraryRef;
  }

  getAllBookLibrary(): AngularFireList<BookLibrary> {
    return this.bookLibraryRef;
  }

  createBorrowUser(bookLib: BorrowLibrary, userName: any): any {
    this.borrowLibraryRef = this.db.list('/borrowBook/'+userName);
    return this.borrowLibraryRef.push(bookLib);
  }

  createBookLibrary(bookLib: BookLibrary): any {
    return this.bookLibraryRef.push(bookLib);
  }

  createUserLibrary(userLib: UserLibrary): any {
    return this.userLibraryRef.push(userLib);
  }

  updateUserLibrary(key: string, value: any): Promise<void> {
    return this.userLibraryRef.update(key, value);
  }

  deleteUserLibrary(key: string): Promise<void> {
    return this.userLibraryRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.userLibraryRef.remove();
  }

}
