export interface AdminState {
    readonly grid: object;
    readonly stacList: STAC[];
    readonly bandsAvailable: string[];
    readonly satellite: String;
    readonly startDate: String;
    readonly lastDate: String;
    readonly tiles: String[];
    readonly definitionInfos: DefinitionCube;
    readonly metadata: MetadataCube;
}

export interface STAC {
    authentication: boolean;
    url: string;
    collection: string;
    token: string;
    totalImages: number;
    collections: string[];
    version: string;
}

export interface IBand {
    name: string;
    common_name: string;

    metadata: {
        expression: {
            bands: string[],
            value: string
        }
    };
}

export interface DefinitionCube {
    bucket: string;
    name: string;
    version: number;
    public: boolean;
    resolution: number;
    temporal: string;
    function: object;
    bands: string[];
    nodata: number;
    bandsQuicklook: string[];
    indexes: IBand[];
    qualityBand: string;
    qualityNodata: number;
}

export interface MetadataCube {
    license: string;
    description: string;
}