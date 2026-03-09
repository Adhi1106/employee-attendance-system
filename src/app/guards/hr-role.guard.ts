import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleService } from '../services/role.service';

export const hrRoleGuard: CanActivateFn = () => {
  const roleService = inject(RoleService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (roleService.isHrRole()) {
    return true;
  }

  snackBar.open('Only HR can access this page.', 'Close', {
    duration: 2500,
  });

  return router.createUrlTree(['/']);
};
