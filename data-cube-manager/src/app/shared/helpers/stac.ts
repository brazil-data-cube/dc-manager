export const collectionsByVersion = (data: any, version: any) => {
    const func = (dictVersion as any)[version]['collections']
    return func(data)
}

export const totalItemsByVersion = (data: any, version: any) => {
    const func = (dictVersion as any)[version]['totalItems']
    return func(data)
}

export interface ILink {
    href: string;
    rel: string;
    title?: string;
}

export interface IContext {
    matched: number;
    returned: number;
}

export interface IFeatureCollection {
    type: "FeatureCollection",
    links: ILink[],
    context?: IContext,
    features: any[]
}

/**
 * Tries to retrieve a list of bands offered by STAC provider.
 *
 * @param stac STAC Response object
 * @returns List of bands found in stac response.
 */
export function getBands(stac: { [key: string]: any }): [string[], any] {
    let bands = [];
    let objectRef = null;

    // When STAC response supports item-assets extension
    if (stac['stac_extensions'] && stac['stac_extensions'].includes('item-assets')) {
        objectRef = stac['item_assets'];

        for(let property of Object.keys(stac['item_assets'])) {
            if (stac['item_assets'][property]['roles'].includes('data')) {
                bands.push(property);
            }
        }
    } else {
        const maybeProperties = ['eo:bands', 'bands'];

        for(let property of maybeProperties) {
            if (stac['properties'][property]) {
                objectRef = stac['properties'][property];
                if (!stac['properties'][property]['0']) {
                    bands = Object.keys(stac['properties'][property])
                } else {
                    bands = stac['properties'][property].map((band: any) => band['name']);
                }
                break;
            }
        }
    }

    return [bands, objectRef];
}

function version1collections(data: any) {
    const links = data['collections']
    return links.map((d: any) => d.id)
}

function version1totalItems(data: any) {
    return data['numberMatched']
}

function version9collections(data: any) {
    const links = data['collections']
    return links.map((d: any) => d.id)
}

function version9totalItems(data: IFeatureCollection) {
    return data.context?.matched
}

function version8collections(data: any) {
    const links = data['links']
    return links.filter((d: ILink) => d.title).map((d: ILink) => d.title)
}

function version8totalItems(data: any) {
    return data['numberMatched']
}

function version6_7collections(data: any) {
    const links = data['collections']
    return links.map((d: any) => d.id)
}

function version6totalItems(data: any) {
    return data['meta']['found']
}

function version7totalItems(data: any) {
    return data['context']['matched']
}

const dictVersion = {
    '1.0': {
        'collections': version1collections,
        'totalItems': version1totalItems
    },
    '0.9': {
        'collections': version9collections,
        'totalItems': version9totalItems
    },
    '0.8': {
        'collections': version8collections,
        'totalItems': version8totalItems
    },
    '0.7': {
        'collections': version6_7collections,
        'totalItems': version7totalItems
    },
    '0.6': {
        'collections': version6_7collections,
        'totalItems': version6totalItems
    }
}