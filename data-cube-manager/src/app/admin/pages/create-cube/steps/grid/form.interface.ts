export interface Grid {
    id: string;
    description: string;
    crs: string;
}

export interface FormGrid {
    name: string;
    description: string;
    meridian: number;
    width: number;
    height: number;
}