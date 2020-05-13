import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, Draw, rectangle, Control, geoJSON } from 'leaflet';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'app/shared/helpers/date.adapter';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';
import { FormImages } from './images.interface';
import { showLoading, closeLoading } from 'app/app.action';
import { Store, select } from '@ngrx/store';
import { AdminState } from 'app/admin/admin.state';

@Component({
  selector: 'app-create-cube-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss'],
  providers: [{
    provide: DateAdapter, useClass: AppDateAdapter
  },
  {
    provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
  }]
})
export class CreateCubeImagesComponent implements OnInit {

  /** pointer to reference map */
  public map: MapLeaflet;
  /** object with map settings */
  public options: MapOptions;

  public collections: string[];
  public urlSTAC: string;
  public form: FormImages;

  constructor(
    private cbs: CubeBuilderService,
    private store: Store<AdminState>,
    private ref: ChangeDetectorRef) {}

  ngOnInit() {
    this.initializeVariables()

    this.store.pipe(select('admin' as any)).subscribe(res => {
      if (res.grid) {
        console.log(res.grid)
        this.selectGrid(res.grid)
      }
    })
  }

  initializeVariables() {
    this.options = {
      zoom: 4,
      layers: [
        tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        })
      ],
      center: latLng(-16, -52)
    }
    this.form = {
      satellite: '',
      collection: '',
      startDate: '',
      lastDate: ''
    }
    this.urlSTAC = ''
    this.collections = []
  }

  async selectGrid(grid) {
    try {
      this.store.dispatch(showLoading());

      this.map.eachLayer(l => {
        if (l.getAttribution() && l.getAttribution().indexOf('BDC-') >= 0) {
          this.map.removeLayer(l)
        }
      })
      
      // plot grid in map
      const response = await this.cbs.getGrids(grid)
      const features = response['tiles'].map(t => {
        return { ...t['geom_wgs84'], id: t['id'] }
      })
      const layer = geoJSON(features, {
        attribution: `BDC-${grid}`
      }).setStyle({
        fillOpacity: 0.1
      })
      this.map.addLayer(layer)
      this.map.fitBounds(layer.getBounds())

    } catch (err) {
      console.log(err)

    } finally {
      this.store.dispatch(closeLoading());
    }
  }

  /**
   * set Draw control of the map
   */
  private setDrawControl() {
    const drawControl = new Control.Draw({
      draw: {
        marker: false,
        circle: false,
        polyline: false,
        polygon: false,
        circlemarker: false,
        rectangle: {
          shapeOptions: {
            color: '#FFF'
          }
        }
      }
    });
    this.map.addControl(drawControl);

    // add bbox in the map
    this.map.on(Draw.Event.CREATED, e => {
      // const layer: any = e['layer'];
      // const newLayer = rectangle(layer.getBounds(), {
      //   color: '#FFF',
      //   weight: 3,
      //   fill: false,
      //   dashArray: '10',
      //   interactive: false,
      //   className: 'previewBbox'
      // });

      // e.sourceTarget.eachLayer(l => {
      //   if (l.getAttribution() && l.getAttribution().indexOf('BDC-') >= 0) {
      //     console.log(l.getAttribution())
      //   }
      // })
      this.ref.detectChanges();
    });
  }

  /**
  * event used when change Map
  */
  onMapReady(map: MapLeaflet) {
    this.map = map
    this.setDrawControl()
  }
}
