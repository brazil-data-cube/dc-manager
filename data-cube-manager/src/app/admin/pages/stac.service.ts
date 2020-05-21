import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class STACService {

    /** start http service client */
    constructor(private http: HttpClient) { }

    /**
     * get stac version
     */
    public async getVersion(url): Promise<any> {
        let urlSuffix = '/stac'
        const response = await this.http.get(`${url}${urlSuffix}`).toPromise()
        return response;
    }

    /**
     * get collections
     */
    public async getCollections(url): Promise<any> {
        let urlSuffix = '/collections'
        const response = await this.http.get(`${url}${urlSuffix}`).toPromise()
        return response;
    }

    /**
     * get items by collections
     */
    public async getItemsByCollection(url, collection, query): Promise<any> {
        let urlSuffix = `/collections/${collection}/items?${query}`
        const response = await this.http.get(`${url}${urlSuffix}`).toPromise()
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
