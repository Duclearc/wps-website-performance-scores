export interface InitialReport {
    performance: {
        title: string,
        supportedModes: any[],
        auditRefs: any[],
        id: string,
        score: number
    } | string,
    accessibility: {
        title: string,
        description: string,
        manualDescription: string,
        supportedModes: any[],
        auditRefs: any[],
        id: string,
        score: number
    } | string,
    'best-practices': {
        title: string,
        supportedModes: any[],
        auditRefs: any[],
        id: string,
        score: number
    } | string,
    seo: {
        title: string,
        description: string,
        manualDescription: string,
        supportedModes: any[],
        auditRefs: any[],
        id: string,
        score: number
    } | string,
    pwa: {
        title: string,
        description: string,
        manualDescription: string,
        supportedModes: any[],
        auditRefs: any[],
        id: string,
        score: number
    } | string
}

export interface FormattedReport {
    website: string,
    scoreDate: string,
    performance: number,
    accessibility: number,
    best_practices: number,
    seo: number,
    pwa: number
}

export interface Args {
    target?: string,
    screenshot?: boolean,
    fullDate?: boolean,
    width?: number,
    height?: number,
}