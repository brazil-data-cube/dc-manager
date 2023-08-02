import { Injectable, SecurityContext } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

export interface JsonOptions {
    replacer: (this: any, key: string, value: any) => any,
    indent?: number
}

@Injectable({ providedIn: 'root' })
export class BrowserUtil {
    constructor(private sanitizer: DomSanitizer) { }

    public exportJSONFile(data: any, jsonOptions?: JsonOptions, mimeType: string = "application/json") {
        const replacer = jsonOptions
            ? jsonOptions.replacer
            : null
        let indent: number = jsonOptions
            ? jsonOptions.indent
            : null
        if (!indent)
            indent = 2

        const blob = new Blob([JSON.stringify(data, replacer, indent)], { type: mimeType })
    
        return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob))
    }

    public sanitizeUrl(resourceUrl: SafeResourceUrl): string {
        return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, resourceUrl);
    }

    public downloadEntries(entries: any, fileName: string) {
        const link = document.createElement('a');
        const linkURL = this.exportJSONFile(entries);
        const res = this.sanitizeUrl(linkURL);

        link.setAttribute('target', '_blank');
        link.setAttribute('href', res);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click()
        link.remove();
    }
}
