import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { BookLibrary } from '../model/bookLibrary';
import { UserLibrary } from '../model/userLibrary';
import { BorrowLibrary } from '../model/borrowLibrary';
import { SafeResourceUrl } from '@angular/platform-browser';
import { HistoryLibrary } from '../model/historyLibrary';
import { WordLibrary } from '../model/wordLibrary';


@Injectable({
  providedIn: 'root'
})
export class RegisterServiceService {

  private dbPath = '/userlibrary';
  private dbPath2 = '/booklibrary';
  private dbPath3 = '/Dictionary/0';
  userLibraryRef: AngularFireList<UserLibrary> = null;
  bookLibraryRef: AngularFireList<BookLibrary> = null;
  borrowLibraryRef: AngularFireList<BorrowLibrary> = null;
  historyLibraryRef: AngularFireList<HistoryLibrary> = null;
  wordLibraryRef: AngularFireList<WordLibrary[]> = null;
  
  constructor(private db: AngularFireDatabase) { 
    this.userLibraryRef = db.list(this.dbPath);
 //   this.bookLibraryRef = db.list(this.dbPath2);
    // this.wordLibraryRef = db.list(this.dbPath3);
  }

  getAllUserLibrary(): AngularFireList<UserLibrary> {
    return this.userLibraryRef;
  }

  getDictionaryBook(bookId: any, keysId: any): AngularFireList<WordLibrary[]>{
    if(keysId == null) {
      this.wordLibraryRef = this.db.list('/Dictionary/'+bookId+'/0');
    } else {
      this.wordLibraryRef = this.db.list('/Dictionary/'+bookId+'/0/'+keysId);
    }
    return this.wordLibraryRef;
  }

  getDescBook(descId: any, keysId: any): AngularFireList<WordLibrary[]> {
    if(keysId == null) {
      this.wordLibraryRef = this.db.list('/Dictionary/'+descId+'/1');
    } else {
      this.wordLibraryRef = this.db.list('/Dictionary/'+descId+'/1/'+keysId);
    }
    return this.wordLibraryRef;
  }

  getWritterBook(writterId: any, keysId: any): AngularFireList<WordLibrary[]> {
    if(keysId == null) {
      this.wordLibraryRef = this.db.list('/Dictionary/'+writterId+'/2');
    } else {
      this.wordLibraryRef = this.db.list('/Dictionary/'+writterId+'/2/'+keysId);
    }
    return this.wordLibraryRef;
  }

  getAllBookLibrary(): AngularFireList<BookLibrary> {
    return this.bookLibraryRef;
  }

  getAllBorrowBook(verify: any): AngularFireList<BorrowLibrary> {
    this.borrowLibraryRef = this.db.list('/borrowBook/'+verify);
    return this.borrowLibraryRef;
  }

  updateValidDate(key: string, value: any, userName: any): Promise<void> {
    value.key = null;
    this.borrowLibraryRef = this.db.list('/borrowBook/'+userName);
    return this.borrowLibraryRef.update(key, value);
  }

  createBorrowUser(bookLib: BorrowLibrary, userName: any): any {
    this.borrowLibraryRef = this.db.list('/borrowBook/'+userName);
    return this.borrowLibraryRef.push(bookLib);
  }

  createBorrowBook(bookLib: BorrowLibrary, rfid: any): any {
    console.log('service RFID:', rfid);
    this.borrowLibraryRef = this.db.list('/borrowBook/'+rfid);
    return this.borrowLibraryRef.push(bookLib);
  }

  createDictionaryBook(wordLib: WordLibrary[], bookId: any): any {
    this.wordLibraryRef = this.db.list('/Dictionary/'+bookId+'/0');
    return this.wordLibraryRef.push(wordLib);
  }

  createDictionaryDesc(descLib: WordLibrary[], bookId: any): any {
    this.wordLibraryRef = this.db.list('/Dictionary/'+bookId+'/1');
    return this.wordLibraryRef.push(descLib);
  }

  createDictionaryWritter(writterLib: WordLibrary[], bookId: any): any {
    this.wordLibraryRef = this.db.list('/Dictionary/'+bookId+'/2');
    return this.wordLibraryRef.push(writterLib);
  }

  createHistoryBook(bookLib: HistoryLibrary, userName: any): any {
    this.historyLibraryRef = this.db.list('/historyBook/'+userName);
    return this.historyLibraryRef.push(bookLib);
  }

  createBookLibrary(bookLib: BookLibrary, photo: SafeResourceUrl): any {
    this.bookLibraryRef = this.db.list('/booklibrary/'+bookLib.book_name+"/"+bookLib.rfid);
    bookLib.imageUrl = photo;
    return this.bookLibraryRef.push(bookLib);
  }

  refreshBookLibrary(book_name: any, rfid: any): Promise<void> {
    this.bookLibraryRef = this.db.list('/booklibrary/'+book_name+"/"+rfid);
    return this.bookLibraryRef.remove();
  }

  refreshDictionary(bookId: any): Promise<void> {
    this.wordLibraryRef = this.db.list('/Dictionary/'+bookId);
    return this.wordLibraryRef.remove();
  }

  updateStatusBook1(key: string,bookLib: any): Promise<void> {
    bookLib.book_status = true;
    return this.bookLibraryRef.update(key, bookLib);
  }

  updateStatusBook2(key: string,bookLib: any): Promise<void> {
    bookLib.book_status = false;
    return this.bookLibraryRef.update(key, bookLib);
  }

  createUserLibrary(userLib: UserLibrary, photo: SafeResourceUrl): any {
    userLib.imageUrl = photo;
    return this.userLibraryRef.push(userLib);
  }

  updateUserLibrary(key: string, value: any): Promise<void> {
    value.key = null;
    return this.userLibraryRef.update(key, value);
  }

  returnBookLibrary(key:string, verify: string): Promise<void> {
    this.borrowLibraryRef = this.db.list('/borrowBook/'+verify);
    return this.borrowLibraryRef.remove(key);
  } 

  deleteUserLibrary(key: string): Promise<void> {
    return this.userLibraryRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.userLibraryRef.remove();
  }

}
