import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { catchError, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { UserService } from 'src/app/services/user/user.service';
import { ErrorInterface } from 'src/app/models/types/errors/error.interface';
import { User } from 'src/app/models/User';

import { currentUserSelector } from '../selectors/auth.selector';
import {
  blockUserAction,
  blockUserFailureAction,
  blockUserSuccessAction,
  getCurrentUserAction,
  getCurrentUserFailureAction,
  getCurrentUserSuccessAction,
  getUserByIdAction,
  getUserByIdFailureAction,
  getUserByIdSuccessAction,
  updateCurrentUserAction,
  updateCurrentUserFailureAction,
  updateCurrentUserSuccessAction,
} from 'src/app/store/actions/user.action';

@Injectable()
export class UserEffects {
  getUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getCurrentUserAction),
      switchMap(({ userId }) => {
        return this.userService.getUserDoc(userId).pipe(
          map((payload: User) => getCurrentUserSuccessAction({ payload })),

          catchError((errorResponse: HttpErrorResponse) => {
            const error: ErrorInterface = {
              message: errorResponse.message,
            };
            return of(getCurrentUserFailureAction({ error }));
          })
        );
      })
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCurrentUserAction),
      switchMap(({ request }) => {
        return this.userService
          .updateUserDoc(request.userId, request.data)
          .pipe(
            map((payload: User) => updateCurrentUserSuccessAction({ payload })),

            catchError((errorResponse: HttpErrorResponse) => {
              const error: ErrorInterface = {
                message: errorResponse.message,
              };
              return of(updateCurrentUserFailureAction({ error }));
            })
          );
      })
    )
  );

  getUserById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getUserByIdAction),
      switchMap(({ userId }) => {
        return this.userService.getUserDoc(userId).pipe(
          map((payload: User) => getUserByIdSuccessAction({ payload })),

          catchError((errorResponse: HttpErrorResponse) => {
            const error: ErrorInterface = {
              message: errorResponse.message,
            };
            return of(getUserByIdFailureAction({ error }));
          })
        );
      })
    )
  );

  redirectAfterGetUserByIdFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(getUserByIdFailureAction),
        tap(() => {
          this.router.navigateByUrl('/home/messages', { replaceUrl: true });
        })
      ),
    { dispatch: false }
  );

  blockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(blockUserAction),
      withLatestFrom(this.store.pipe(select(currentUserSelector))),
      switchMap(([{ request }, currentUser]) => {
        return this.userService.blockUser(currentUser, request.userId).pipe(
          tap((a) => console.log('blockUser$ effect:', a)),
          map((payload: User) => blockUserSuccessAction({ payload })),

          catchError((errorResponse: HttpErrorResponse) => {
            const error: ErrorInterface = {
              message: errorResponse.message,
            };
            return of(blockUserFailureAction({ error }));
          })
        );
      })
    )
  );

  constructor(
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private userService: UserService
  ) {}
}
