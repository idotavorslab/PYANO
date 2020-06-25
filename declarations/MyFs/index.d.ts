declare function createIfNotExists(path: string): boolean;
declare function isEmpty(abspath: string, { recursive }: {
    recursive: boolean;
}): boolean;
declare function getEmptyDirs(abspath: string): string[];
declare function removeEmptyDirs(abspath: string): void;
declare const _default: {
    createIfNotExists: typeof createIfNotExists;
    isEmpty: typeof isEmpty;
    getEmptyDirs: typeof getEmptyDirs;
    removeEmptyDirs: typeof removeEmptyDirs;
};
export default _default;
//# sourceMappingURL=index.d.ts.map