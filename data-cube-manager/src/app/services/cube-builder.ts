import { Injectable } from '@angular/core';
import api from "./main";
import { BrowserUtil } from 'app/shared/browser';

interface ICubesFilter {
    name?: string;
    public?: boolean;
    collection_type?: 'all' | 'cube' | 'mosaic'
}

@Injectable({ providedIn: 'root' })
export class CubeBuilderService {

    /** url base of Cube Builder*/
    private urlCubeBuilder: null|string = null;

    /** get cube-builder url */
    constructor(
        private browserSvc: BrowserUtil
    ) {
        if (!!localStorage.getItem('DC_MANAGER_url_service')) {
            this.urlCubeBuilder = localStorage.getItem('DC_MANAGER_url_service');
        }
    }

    /**
     * verify token
     */
    public async verifyToken(urlService: string, token: null|string = null): Promise<any> {
        const headers = token ? { headers: { 'x-api-key': token } } : {}
        const { data } = await api.get(`${urlService}/`, headers);
        return data;
    }

    /**
     * get cube metadata
     */
    public async getCubes(id = null, params: null|ICubesFilter = null): Promise<any> {
        let urlSuffix = '/cubes'
        if (id) {
            urlSuffix += `/${id}`
        }
        if (params === null) {
            params = {}
        }

        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`, { params });
        return data;
    }

    /**
     * get cube status
     */
    public async getCubeStatus(cubeFullName: string): Promise<any> {
        let urlSuffix = `/cube-status?cube_name=${cubeFullName}`
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`);
        return data;
    }

    /**
     * get cube geojson (tiles)
     */
    public async getGeoJSON(id: string): Promise<any> {
        let urlSuffix = `/cubes/${id}/tiles/geom`;
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`);
        return data;
    }

    /**
     * get grids metadata
     */
    public async getGrids(id = null, bbox = null, tiles = null): Promise<any> {
        let urlSuffix = '/grids'
        if (id) {
            urlSuffix += `/${id}`
        }
        const params: { [key: string]: string } = { }
        if (!!tiles) {
            params['tiles'] = tiles
        }
        if (!!bbox) {
            params['bbox'] = bbox
        }
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`, { params });
        return data;
    }

    /**
     * create cube metadata
     */
    public async create(infos: any): Promise<any> {
        const urlSuffix = '/cubes';
        const { data } = await api.post(`${this.urlCubeBuilder}${urlSuffix}`, infos);
        return data;
    }

    /**
     * start cube proccesses
     */
    public async start(infos: any): Promise<any> {
        const urlSuffix = '/start';
        const { data } = await api.post(`${this.urlCubeBuilder}${urlSuffix}`, infos);
        return data;
    }

    /**
     * start cube proccesses
     */
    public async update(cubeId: string, infos: any): Promise<any> {
        const urlSuffix = `/cubes/${cubeId}`;
        const { data } = await api.put(`${this.urlCubeBuilder}${urlSuffix}`, infos);
        return data;
    }

    /**
     * Update the given data cube instance parameters and make it available in execution.
     *
     * @param cubeId Data Cube Identifier.
     * @param parameters Map of parameters to be set on Data Cube Instance.
     */
    public async updateCubeParameters(cubeId: string, parameters: any): Promise<any> {
        const urlSuffix = `/cubes/${cubeId}/parameters`;
        const { data } = await api.put(`${this.urlCubeBuilder}${urlSuffix}`, parameters);
        return data;
    }

    /**
     * create raster size schema
     */
    public async createBucket(infos: any): Promise<any> {
        const urlSuffix = '/create-bucket';
        const { data } = await api.post(`${this.urlCubeBuilder}${urlSuffix}`, infos);
        return data;
    }

    /**
     * list merges by blend
     */
    public async listMerges(cube_id: string, start_date: string, end_date: string, tileID: string): Promise<any> {
        const options = {} as any;
        options.params = {
            cube_id,
            start_date,
            end_date,
            tile_id: tileID,
        }

        const urlSuffix = `/list-merges`;
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`, options);
        return data;
    }

    /**
     * get cube timeline
     */
    public async getTimeline(dataQuery: any): Promise<any> {
        const urlSuffix = `/list-periods`;
        const { data } = await api.post(`${this.urlCubeBuilder}${urlSuffix}`, dataQuery);
        return data;
    }


    /**
     * get composite functions
     */
    public async getCompositeFunctions(): Promise<any> {
        const urlSuffix = `/composite-functions`;
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`);
        return data;
    }

    /**
     * get buckets
     */
    public async getBuckets(): Promise<any> {
        const urlSuffix = `/list-buckets`;
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`);
        return data;
    }

    /**
     * create grid (grs_schema)
     */
    public async createGrid(infos: any): Promise<any> {
        const urlSuffix = `/create-grids`;
        const { data } = await api.post(`${this.urlCubeBuilder}${urlSuffix}`, infos);
        return data;
    }

    /**
     * get cube metadata
     */
    public async listItems(cube: string, bbox?: string, start?: string, end?: string, tiles?: string, page?: number): Promise<any> {
        page = page || 1;
        const perPage = 10000;
        const options = {} as any;
        options.params = { page, 'per_page': perPage };
        if (bbox) options.params.bbox = bbox;
        if (start) options.params.start = start;
        if (end) options.params.end = end;
        if (tiles) options.params.tiles = tiles;

        let urlSuffix = `/cubes/${cube}/items`;
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`, options);
        return data;
    }

    public async listItemsTiles(id: string) {
        const urlSuffix = `/cubes/${id}/tiles`;
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`);
        return data;
    }

    public async getCubeMeta(cube: string) {
        const urlSuffix = `/cubes/${cube}/meta`;
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`);
        return data;
    }

    public async estimateCost(infos: any) {
        const urlSuffix = `/estimate-cost`;
        const { data } = await api.post(`${this.urlCubeBuilder}${urlSuffix}`, infos);
        return data;
    }

    public async getBuilderVersion() {
        const urlSuffix = `/`;
        const { data } = await api.get(`${this.urlCubeBuilder}${urlSuffix}`);
        return data.version;
    }

    /**
     * start cube proccesses
     */
    public async reprocess(cubeId: string, tiles?: string[]): Promise<any> {
        const body = { }
        if (!!tiles) {
            body["tiles"] = tiles
        }

        const urlSuffix = `/cubes/${cubeId}/complete`;
        const { data } = await api.post(`${this.urlCubeBuilder}${urlSuffix}`, body);
        return data;
    }

    async downloadMergeScenes(cubeId: string, tileId: string, startDate: string, endDate: string, fileName: string) {
        const scenes: Set<string> = new Set<string>()
        const response = await this.listMerges(cubeId, startDate, endDate, tileId)

        for(let mergeDate of Object.keys(response)) {
            const merge = response[mergeDate];
            for (let error of merge['errors']) {
                scenes.add(error['filename'])
            }
        }

        this.browserSvc.downloadEntries(Array.from(scenes), fileName)
    }
}
