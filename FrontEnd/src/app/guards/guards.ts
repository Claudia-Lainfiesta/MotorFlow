import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
export const authGuard: CanActivateFn = () => {
  const a = inject(AuthService);
  return a.authenticated() || inject(Router).createUrlTree(["/"]);
};
export const adminGuard: CanActivateFn = () => {
  const a = inject(AuthService);
  return a.isAdmin() || inject(Router).createUrlTree(["/"]);
};
