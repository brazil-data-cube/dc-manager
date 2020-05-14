import { MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { CubeBuilderService } from "app/admin/pages/cube-builder.service";
import { Store } from "@ngrx/store";
import { token, showLoading, closeLoading } from "app/app.action";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
    selector: 'token-modal',
    templateUrl: 'token.component.html',
    styleUrls: ['./token.component.scss']
})
export class TokenModal {

    public token: string = ''

    constructor(
        public dialogRef: MatDialogRef<TokenModal>,
        private store: Store,
        private snackBar: MatSnackBar,
        private cbs: CubeBuilderService,
        private router: Router) { }

    async verify() {
        try {
            this.store.dispatch(showLoading())
            const _ = await this.cbs.verifyToken(this.token)
            this.store.dispatch(token({ token: this.token }))
            this.router.navigate(['/list-cubes']);
            this.dialogRef.close()

        } catch (_) {
            this.snackBar.open('Invalid Token!', '', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'app_snack-bar-error'
            });
            
        } finally {
            this.store.dispatch(closeLoading())
        }
    }
}