import { Component, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { timer, Observable, Subscription, of } from "rxjs";
import { tap, catchError, delay, map } from "rxjs/operators";
import { clearInterval } from "timers";

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
  sprookje: string[];

  constructor(private http: HttpClient) {}

  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.log(error);
      return of(result as T);
    };
  }

  getNewUsers() {
    this.apiSource = this.http.get<Observable<any[]>>(apiUrl);
    this.apiSource
      .pipe(
        tap(() => console.log("Users opgehaald")),
        catchError(e => this.handleError("getNewUser", []))
      )
      .subscribe(res => console.log(res));
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
    console.log("this.subscription after: ", this.subscription);
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
        const intervalId = setInterval(() => console.log(arr[i++]), 500);
        i === arr.length - 1 ? clearInterval(intervalId) : null;
      });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.removeSubscription();
  }
}
