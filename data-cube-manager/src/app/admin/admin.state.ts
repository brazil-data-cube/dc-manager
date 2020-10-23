export interface AdminState {
    readonly grid: object;
    readonly urlSTAC: String;
    readonly bandsAvailable: string[];
    readonly collection: String;
    readonly satellite: String;
    readonly startDate: String;
    readonly lastDate: String;
    readonly tiles: String[];
    readonly definitionInfos: DefinitionCube;
    readonly metadata: MetadataCube;
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
    bandsQuicklook: string[];
    indexes: string[];
    qualityBand: string;
}

export interface MetadataCube {
    license: string;
    description: string;
    additional: string;
}