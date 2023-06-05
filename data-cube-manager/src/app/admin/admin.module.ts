import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AceEditorModule } from 'ng2-ace-editor';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';

import { AdminRoutes } from './admin.routing';

import { AdminGuardService } from './admin-guard.service';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SharedModule } from 'app/shared/shared.module';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { ListCubesComponent } from './pages/list-cubes/list-cubes.component';
import { DetailsCubeComponent } from './pages/details-cube/details-cube.component';
import { CheckCubeComponent } from './pages/check-cube/check-cube.component';
import { CreateCubeComponent } from './pages/create-cube/create-cube.component';
import { StepLayerComponent } from './components/step-layout/step-layout.component';
import { MiniCardComponent } from './components/mini-card/mini-card.component';
import { CreateCubeImagesComponent } from './pages/create-cube/steps/images/images.component';
import { CreateCubeGridComponent } from './pages/create-cube/steps/grid/grid.component';
import { CreateCubeDefinitionComponent } from './pages/create-cube/steps/definition/definition.component';
import { CreateCubeMetadataComponent } from './pages/create-cube/steps/metadata/metadata.component';
import { CreateCubePreviewComponent } from './pages/create-cube/steps/preview/preview.component';
import { TemporalCompositionModal } from './pages/create-cube/steps/definition/temporal/temporal.component';
import { EstimateCostModal } from './pages/create-cube/steps/definition/estimate-cost/estimate-cost.component';
import { MapModal } from './components/map-modal/map-modal.component';
import { SceneDetailsComponent } from './pages/check-cube/scene-details/scene-details.component';
import { ReprocessDialogComponent } from './components/reprocess-dialog/reprocess-dialog.component';
import { BucketsModal } from './pages/create-cube/steps/definition/buckets/buckets.component';
import { MapFieldComponent } from './components/map-field/map-field.component';
import { UpdateCubeDialog } from './components/update-cube-dialog/update-cube-dialog.component';
import { UpdateBandDialogComponent } from './components/update-band-dialog/update-band-dialog.component';
import { CustomBandDialogComponent } from './pages/create-cube/steps/definition/custom-band-dialog/custom-band-dialog.component';
import { BandsDialogComponent } from './components/bands-dialog/bands-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminRoutes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatBadgeModule,
    MatRadioModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatProgressBarModule,
    MatStepperModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatIconModule,
    MatTabsModule,
    NgxPaginationModule,
    LeafletModule,
    LeafletDrawModule,
    MatPaginatorModule,
    MatCheckboxModule,
    AceEditorModule,
    MatTooltipModule
  ],
  declarations: [
    AdminLayoutComponent,
    ListCubesComponent,
    DetailsCubeComponent,
    CheckCubeComponent,
    CreateCubeComponent,
    CreateCubeImagesComponent,
    CreateCubeGridComponent,
    CreateCubeDefinitionComponent,
    CreateCubeMetadataComponent,
    CreateCubePreviewComponent,
    StepLayerComponent,
    MiniCardComponent,
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    TemporalCompositionModal,
    EstimateCostModal,
    MapModal,
    SceneDetailsComponent,
    ReprocessDialogComponent,
    UpdateCubeDialog,
    UpdateBandDialogComponent,
    BucketsModal,
    MapFieldComponent,
    UpdateBandDialogComponent,
    CustomBandDialogComponent,
    BandsDialogComponent,
  ],
  providers: [
    AdminGuardService
  ]
})

export class AdminModule {}
