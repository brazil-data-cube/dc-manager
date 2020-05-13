import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { latLng, MapOptions, Map as MapLeaflet, tileLayer, Draw, rectangle, Control, geoJSON } from 'leaflet';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';

@Component({
  selector: 'app-create-cube-definition',
  templateUrl: './definition.component.html',
  styleUrls: ['./definition.component.scss']
})
export class CreateCubeDefinitionComponent implements OnInit {

  /** pointer to reference map */
  public map: MapLeaflet;
  /** object with map settings */
  public options: MapOptions;

  public grids = [];
  public action = 'select';
  public bbox = ''
  public form = {
    name: '',
    description: '',
    meridian: null,
    width: 1.5,
    height: 1,
  };
  public grid = {
    id: '',
    description: '',
    crs: ''
  };

  constructor(
    private cbs: CubeBuilderService,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.options = {
      zoom: 4,
      layers: [
        tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        })
      ],
      center: latLng(-16, -52)
    }
    this.getGrids()
  }

  async getGrids() {
    try {
      const response = await this.cbs.getGrids()
      this.grids = response.filter(g => g.crs)

    } catch (err) {
      console.log(err)
    }
  }

  async selectGrid(grid) {
    try {
      this.removeGrid(this.grid.id)
      
      // plot grid in map
      this.grid = grid;
      const response = await this.cbs.getGrids(grid.id)
      const features = response['tiles'].map(t => {
        return { ...t['geom_wgs84'], id: t['id'] }
      })
      const layer = geoJSON(features, {
        attribution: `BDC-${grid.id}`
      }).setStyle({
        fillOpacity: 0.1
      })
      this.map.addLayer(layer)
      this.bbox = layer.getBounds().toBBoxString()
      this.map.fitBounds(layer.getBounds())

    } catch (err) {
      console.log(err)
    }
  }

  removeGrid(grid) {
    this.map.eachLayer(l => {
      if (l.getAttribution() === `BDC-${grid}`) {
        this.map.removeLayer(l)
      }
    })
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

    // remove last bbox
    this.map.on(Draw.Event.DRAWSTART, _ => {
      this.map.eachLayer(l => {
        if (l['options'].className === 'previewBbox') {
          this.map.removeLayer(l);
        }
      });
    });

    // add bbox in the map
    this.map.on(Draw.Event.CREATED, e => {
      const layer: any = e['layer'];
      const newLayer = rectangle(layer.getBounds(), {
        color: '#FFF',
        weight: 3,
        fill: false,
        dashArray: '10',
        interactive: false,
        className: 'previewBbox'
      });

      this.map.addLayer(newLayer);
      this.ref.detectChanges();
    });
  }

  /**
  * event used when change Map
  */
  onMapReady(map: MapLeaflet) {
    this.map = map;
    this.setDrawControl();
  }
}
