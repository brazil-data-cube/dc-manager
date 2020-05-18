export interface Grid {
    id: string;
    description: string;
    crs: string;
}

export interface FormGrid {
    name: string;
    description: string;
    meridian: number;
    degreesx: number;
    degreesy: number;
}