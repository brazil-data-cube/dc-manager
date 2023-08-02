import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { CubeBuilderService } from 'app/services/cube-builder';
import { closeLoading, showLoading } from 'app/app.action';
import { AppState } from 'app/app.state';
import * as moment from "moment";

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ReprocessDialogComponent } from 'app/admin/components/reprocess-dialog/reprocess-dialog.component';

export interface TimeStep {
  start: string;
  end: string;
}

export interface TileElement {
  tile: string;
  total: number;
  missing: TimeStep[]
}

type CubeStats = {
  totalTiles: number
  totalTimeline: number
}

type TimeStepMap = { [key: string]: TimeStep }

type FilterCondition = (data: TileElement, v: string) => boolean

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class OverviewComponent implements AfterViewInit {
  dataSource: MatTableDataSource<TileElement>
  columnsToDisplay = ['tile', 'total']
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand']

  columnsPeriodTable = ["start", "end"]
  expandedElement: TileElement | null
  cube: any
  searchForm: FormGroup;
  stats: CubeStats
  timeline: TimeStepMap

  @ViewChild("paginator") paginator: MatPaginator

  constructor(
    private cubeBuilderSvc: CubeBuilderService,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    this.searchForm = this.fb.group({
      tileField: [''],
      showErrorOnly: [true]
    })

    this.dataSource = new MatTableDataSource();

    this.route.paramMap.subscribe(async params => {
      this.configureComponent(params['params']['cube'].split(':')[1])
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  async configureComponent(cubeId: string | number) {
    try {
      this.store.dispatch(showLoading())

      const cubeInfo = await this.getCubeInfo(cubeId)
      const timeline = await this.getTimeline(
        moment(cubeInfo.start_date).utc().format(),
        moment(cubeInfo.end_date).utc().format(),
        cubeInfo.temporal_composition_schema
      )
      this.timeline = timeline
      this.cube = cubeInfo
      this.stats = { totalTiles: Object.keys(cubeInfo.cube_summary).length, totalTimeline: cubeInfo.timeline.length }
      this.dataSource.data = this.getTilesInfo(cubeInfo)

      this.filterDataSet()
    } finally {
      this.store.dispatch(closeLoading())
    }
  }

  async getCubeInfo(cubeId: string | number) {
    const response = await this.cubeBuilderSvc.getCubes(cubeId)
    // const response = jsonData;

    return response
  }

  async getTimeline(startDate, endDate, schema: any): Promise<TimeStepMap> {
    const data = {
      start_date: startDate,
      last_date: endDate,
      ...schema
    }

    const respTimeline = await this.cubeBuilderSvc.getTimeline(data)
    const entries = respTimeline["timeline"].map(period => ([period[0], { start: period[0], end: period[1] }]))
    const timeSteps: TimeStepMap = Object.fromEntries(entries)

    return timeSteps
  }

  getTilesInfo(cube: any): TileElement[] {
    const fmt: string = "YYYY-MM-DD"

    let tileInfos: TileElement[] = Object.keys(cube["cube_summary"])
      .map((tile: string) => {

        const missing: TimeStep[] = cube["cube_summary"][tile]["missing"]
          .map(timeInstant => {
            const timeStep = this.timeline[moment(timeInstant).format(fmt)]

            return timeStep
          })

        const total = cube["cube_summary"][tile]["total"]
        const tileInfo: TileElement = {
          tile,
          missing,
          total
        }
        return tileInfo
      })

    return tileInfos
  }

  filterDataSet() {
    let { tileField, showErrorOnly } = this.searchForm.value
    if (!tileField) {
      tileField = ""
    }
  
    this.setFilterByName()

    if (tileField === "") {
      this.dataSource.filter = "*"; // wildcard to match any error
    } else {
      this.dataSource.filter = tileField.trim()
    }
  }

  setFilterByName() {
    const self = this
    this.dataSource.filterPredicate = function(data: TileElement, filter: string) {
      const { showErrorOnly } = self.searchForm.value
      const chainConditions: FilterCondition[] = [
        (obj: TileElement, v: string) => obj.tile === v || v === "*"
      ]
      if (showErrorOnly) {
        chainConditions.push((obj: TileElement, v: string) => obj.missing.length > 0)
      }

      return chainConditions.every(fn => fn(data, filter))
    };
  }

  async reprocessAll() {
    try {
      this.store.dispatch(showLoading())
      await this.cubeBuilderSvc.reprocess(this.cube.id)

      const message = "The re-process were scheduled."
      this.snackBar.open(message, '', { duration: 4000, verticalPosition: 'top', panelClass: 'app_snack-bar-success' })
    } catch (err) {
      const message: string = `Error in reprocess data cube ${this.cube.name}-${this.cube.version}`
      this.snackBar.open(message, '', { duration: 4000, verticalPosition: 'top', panelClass: 'app_snack-bar-error' })
    } finally {
      this.store.dispatch(closeLoading())
    }
  }

  async reprocessTile(tileId: string, step?: TimeStep) {
    if (!!tileId && !!step) {
      try {
        this.store.dispatch(showLoading());
        const meta = await this.cubeBuilderSvc.getCubeMeta(this.cube.id);

        const dialogRef = this.dialog.open(ReprocessDialogComponent, {
            width: '450px',
            disableClose: true,
            data: {
                ...meta,
                title: `Reprocess ${this.cube.name} - ${tileId}`,
                grid: this.cube.grid,
                datacube: this.cube.name,
                datacube_version: this.cube.version,
                tiles: [tileId],
                editable: false,
                start_date: step.start,
                end_date: step.end,
                force: true
            }
        })
        dialogRef.afterClosed();
      } catch (err) {
        console.log('Error in getting information to reprocess.');
      } finally {
        this.store.dispatch(closeLoading());
      }

      return
    }

    await this.cubeBuilderSvc.reprocess(this.cube.id, [tileId])
  }

  async downloadScenes(tileId: string, timeStep: TimeStep) {
    try {
      this.store.dispatch(showLoading())
      this.cubeBuilderSvc.downloadMergeScenes(this.cube.id, tileId, timeStep.start, timeStep.end, "scenes-error.json")
    } finally {
      this.store.dispatch(closeLoading())
    }
  }
}