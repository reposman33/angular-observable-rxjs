import { Component, ViewChild, ElementRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { timer, Observable, Subscription, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { By } from "protractor";

const apiUrl = "https://jsonplaceholder.typicode.com/users";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "angular-observable-rxjs";
  source: Observable<number | string>;
  apiSource: Observable<object>;
  subscription: Subscription;
  users: object[];
  userKeys: string[];
  userKey: string = "username";
  USERS_URL = "https://jsonplaceholder.typicode.com/users";

  constructor(private http: HttpClient) {}

  @ViewChild("myName", { static: false }) myName: ElementRef;

  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.log(error);
      return of(result as T);
    };
  }

  getNewUsers(
    order:
      | "name"
      | "username"
      | "email"
      | "address"
      | "address-city"
      | "phone"
      | "website"
      | "company-name" = "name"
  ) {
    this.apiSource = this.http.get<Observable<object[]>>(apiUrl);
    this.apiSource
      .pipe(
        map(users =>
          this.flattenObjects(Object.keys(users).map(key => users[key]))
        ),
        map(users => {
          this.userKeys = Object.keys(users[0]);
          return this.sortByKey(users, this.userKey);
        }),
        catchError(e => this.handleError("getNewUser", []))
      )
      .subscribe(res => {
        this.users = res;
      });
  }

  sortByKey(arr: object[], key: string): object[] {
    return arr.sort((a: object, b: object) => (a[key] < b[key] ? -1 : 1));
  }

  flattenObjects(arr: object[]): object[] {
    const flattenObject = (
      ob: object,
      parentOb: object = {},
      parentKey: string = ""
    ): object => {
      Object.keys(ob).map(key =>
        ob[key].toString() === "[object Object]"
          ? flattenObject(ob[key], parentOb, parentKey + key + "_")
          : Object.assign(parentOb, parentOb, {
              [parentKey.length ? parentKey + key : key]: ob[key]
            })
      );
      return parentOb;
    };
    return arr.map(el => flattenObject(el));
  }

  removeSubscription() {
    this.subscription && !this.subscription.closed
      ? this.subscription.unsubscribe()
      : null;
  }

  startCounting() {
    this.removeSubscription();
    this.subscription = timer(250, 750).subscribe({
      next: val => console.log(val),
      error: e => console.log(e),
      complete: () => console.log("Completed!")
    });
  }

  showItems() {
    this.removeSubscription();
    this.source = of("apple", "orange", "grappe");
    this.subscription = this.source.subscribe({
      next: (item: string) => console.log("Observer got next value: ", item),
      error: (e: string) => console.log(`error`, e),
      complete: () => console.log("Complete")
    });
  }

  tellATale() {
    console.log("Once upon a time...");
    this.subscription = this.http
      .get("resources/sprookje.txt", { responseType: "text" })
      .pipe(map(data => data.split(" ")))
      .subscribe(arr => {
        let i = 0;
        const intervalId = setInterval(() => console.log(`${arr[i++]}`), 400);
        i === arr.length - 1 ? clearInterval(intervalId) : null;
      });
  }

  onInput(e) {
    this.users = this.users.filter(user =>
      user[this.userKey].startsWith(e.target.value)
    );
    //this.http.get(this.USERS_URL);
  }
  ngOnInit() {
    this.getNewUsers();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.removeSubscription();
  }
}
