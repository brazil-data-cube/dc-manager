/**
 * Helper to check if the given value is a string.
 */
export function isString(value: any): boolean {
    return typeof value === 'string' || value instanceof String;
}


export function isIdentity(cube: any): boolean {
    if (!cube) {
        return false;
    }
    return getCompositeFunction(cube) === 'IDT';
}


export function getCompositeFunction(cube: any): string {
    if (!cube) {
        return ;
    }
    // For compatibility
    let alias = cube.composite_function;
    if (!isString(cube.composite_function)) {
        alias = cube.composite_function.alias
    }
    return alias;
}


export function getCubeBuilderVersion(): string {
    return localStorage.getItem("DC_MANAGER_BUILDER_VERSION");
}

export function setCubeBuilderVersion(version: string) {
    localStorage.setItem("DC_MANAGER_BUILDER_VERSION", version);
}
