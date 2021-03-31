import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { join } from '@fireflysemantics/join';

@Injectable({ providedIn: 'root' })
export class STACService {

    /** start http service client */
    constructor(private http: HttpClient) { }

    /**
     * get stac version
     */
    public async getVersion(url): Promise<any> {
        const response = await this.http.get(`${url}`).toPromise();
        if (!response['stac_version']) {
            const response = await this.http.get(`${url}/stac`).toPromise();
            return response;
        }
        return response;
    }

    /**
     * get collections
     */
    public async getCollections(url, params: any = { }): Promise<any> {
        let urlSuffix = '/collections'
        const response = await this.http.get(`${url}${urlSuffix}`, { params }).toPromise()
        return response;
    }

    /**
     * get items by collections
     */
    public async getItemsByCollection(url, collection, query, params: any = { }): Promise<any> {
        const q = {
            collections: [collection],
            ...query
        }

        let urlSuffix = `/search`
        const response = await this.http.post(join(url, urlSuffix), q, { params, headers: {'Content-Type': 'application/json'}}).toPromise()
        return response;
    }

    /**
     * get collection informations
     */
    public async getCollectionInfo(url, collection): Promise<any> {
        let urlSuffix = `/collections/${collection}`
        const response = await this.http.get(`${url}${urlSuffix}`).toPromise()
        return response;
    }

}
