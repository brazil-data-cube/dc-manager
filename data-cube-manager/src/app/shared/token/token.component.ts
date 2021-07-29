import { MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { CubeBuilderService } from "app/services/cube-builder";
import { Store } from "@ngrx/store";
import { token, showLoading, closeLoading, setURLCubeBuilder } from "app/app.action";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'token-modal',
    templateUrl: 'token.component.html',
    styleUrls: ['./token.component.scss']
})
export class TokenModal {

    public urlService: string = ''
    public token: string = ''

    constructor(
        public dialogRef: MatDialogRef<TokenModal>,
        private store: Store,
        private snackBar: MatSnackBar,
        private cbs: CubeBuilderService) { }

    async verify() {
        try {
            this.store.dispatch(showLoading())
            const _ = await this.cbs.verifyToken(this.urlService, this.token)
            this.store.dispatch(token({ token: this.token }))
            this.store.dispatch(setURLCubeBuilder({ url: this.urlService }))
            window.location.reload();
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