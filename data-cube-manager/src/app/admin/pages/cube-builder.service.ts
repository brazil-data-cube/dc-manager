import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CubeBuilderService {

    /** url base of Cube Builder*/
    private urlCubeBuilder = window['__env'].urlCubeBuilder;

    /** start http service client */
    constructor(private http: HttpClient) { }

    /**
     * get cube metadata
     */
    public async getCubes(id=null): Promise<any> {
        let urlSuffix = '/cubes';
        if (id) {
            urlSuffix += `/${id}`
        }
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`).toPromise();
        return response;
    }

    /**
     * get cube geojson (tiles)
     */
    public async getGeoJSON(id): Promise<any> {
        let urlSuffix = `/cubes/${id}/tiles`;
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`).toPromise();
        return response;
    }

    /**
     * get grids metadata
     */
    public async getGrids(id=null): Promise<any> {
        let urlSuffix = '/grs';
        if (id) {
            urlSuffix += `/${id}`
        }
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`).toPromise();
        return response;
    }

    /**
     * create cube metadata
     */
    public async create(data, token): Promise<any> {
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        const urlSuffix = '/cubes/create';
        const response = await this.http.post(`${this.urlCubeBuilder}${urlSuffix}`, data, headers).toPromise();
        return response;
    }

    /**
     * start cube proccesses
     */
    public async start(data, token): Promise<any> {
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        const urlSuffix = '/cubes/process';
        const response = await this.http.post(`${this.urlCubeBuilder}${urlSuffix}`, data, headers).toPromise();
        return response;
    }

    /**
     * list merges by blend
     */
    public async listMerges(cube, startDate, lastDate, tileID, token): Promise<any> {
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        const urlSuffix = `/cubes/list-merges?datacube=${cube}&start_date=${startDate}&last_date=${lastDate}&tile=${tileID}`;
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise();
        return response;
    }

    /**
     * get cube timeline
     */
    public async getTimeline(startDate, lastDate, schema, step, token): Promise<any> {
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        const urlSuffix = `/cubes/list-periods?start_date=${startDate}&last_date=${lastDate}&schema=${schema}&step=${step}`;
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise();
        return response;
    }
}
