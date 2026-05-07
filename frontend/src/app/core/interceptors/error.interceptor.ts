import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'An unexpected error occurred';
        if (error.error?.message) {
          message = error.error.message;
        } else if (error.status === 401) {
          message = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          message = 'You do not have permission to perform this action.';
        }
        this.snackBar.open(message, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
        return throwError(() => error);
      })
    );
  }
}
