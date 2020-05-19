import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CubeBuilderService {

    /** url base of Cube Builder*/
    private urlCubeBuilder = window['__env'].urlCubeBuilder;

    /** start http service client */
    constructor(private http: HttpClient) { }

    /**
     * verify token
     */
    public async verifyToken(token=null): Promise<any> {
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        let urlSuffix = '/'
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise()
        return response;
    }

    /**
     * get cube metadata
     */
    public async getCubes(id=null): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        let urlSuffix = '/cubes'
        if (id) {
            urlSuffix += `/${id}`
        }
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise()
        return response;
    }

    /**
     * get cube status
     */
    public async getCubeStatus(datacube): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        let urlSuffix = `/cube-status?datacube=${datacube}`
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise()
        return response
    }

    /**
     * get cube geojson (tiles)
     */
    public async getGeoJSON(id): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        let urlSuffix = `/cubes/${id}/tiles`
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise()
        return response
    }

    /**
     * get grids metadata
     */
    public async getGrids(id=null): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        let urlSuffix = '/grs'
        if (id) {
            urlSuffix += `/${id}`
        }
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise()
        return response
    }

    /**
     * create cube metadata
     */
    public async create(data): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const urlSuffix = '/cubes/create';
        const response = await this.http.post(`${this.urlCubeBuilder}${urlSuffix}`, data, headers).toPromise();
        return response;
    }

    /**
     * start cube proccesses
     */
    public async start(data): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const urlSuffix = '/cubes/process';
        const response = await this.http.post(`${this.urlCubeBuilder}${urlSuffix}`, data, headers).toPromise();
        return response;
    }

    /**
     * list merges by blend
     */
    public async listMerges(cube, startDate, lastDate, tileID): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const urlSuffix = `/cubes/list-merges?datacube=${cube}&start_date=${startDate}&last_date=${lastDate}&tile=${tileID}`;
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise();
        return response;
    }

    /**
     * get cube timeline
     */
    public async getTimeline(startDate, lastDate, schema, step): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const urlSuffix = `/cubes/list-periods?start_date=${startDate}&last_date=${lastDate}&schema=${schema}&step=${step}`;
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise();
        return response;
    }

    /**
     * get temporal compositions
     */
    public async getTemporalCompositions(): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const urlSuffix = `/temporal-composition`;
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise();
        return response;
    }

    /**
     * create temporal compositions
     */
    public async createTemporalComposition(data): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const urlSuffix = `/create-temporal-composition`;
        const response = await this.http.post(`${this.urlCubeBuilder}${urlSuffix}`, data, headers).toPromise();
        return response;
    }

    /**
     * get composite functions
     */
    public async getCompositeFunctions(): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const urlSuffix = `/composite-functions`;
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise();
        return response;
    }

    /**
     * get buckets
     */
    public async getBuckets(): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const urlSuffix = `/list-buckets`;
        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, headers).toPromise();
        return response;
    }

    /**
     * create grid (grs_schema)
     */
    public async createGrid(data): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const urlSuffix = `/create-grs`;
        const response = await this.http.post(`${this.urlCubeBuilder}${urlSuffix}`, data, headers).toPromise();
        return response;
    }

    /**
     * get cube metadata
     */
    public async listItems(cube: string, bbox?: string, start?: string, end?: string, page?: number): Promise<any> {
        const token = sessionStorage.getItem('dc_manager_api_token')

        const options = {} as any;
        if (token) {
            options.headers = { 'x-api-key': token };
        }

        let urlSuffix = `/cubes/${cube}/items`;

        page = page || 1;

        options.params = { page };

        if (bbox)
            options.params.bbox = bbox;

        if (start)
            options.params.start = start;

        if (end)
            options.params.end = end;

        const response = await this.http.get(`${this.urlCubeBuilder}${urlSuffix}`, options).toPromise()
        return response;
    }
}
