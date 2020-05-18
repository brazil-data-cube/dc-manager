export interface Form {
    bucket: string;
    name: string;
    resolution: number;
    temporalComposite: string;
    compositeFunctions: string[];
    bands: string[];
    bandsQuicklook: string[];
}

export interface TemporalComposition {
    id: string;
    temporal_schema?: string;
    temporal_composite_t?: string;
    temporal_composite_unit?: string;
}

export interface CompositeFunction {
    id: string;
    description?: string;
}