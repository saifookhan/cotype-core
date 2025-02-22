/// <reference types="node" />
export default interface Storage {
    getFile(id: string): string;
    store(id: string, stream: NodeJS.ReadableStream): Promise<number>;
    retrieve(id: string): NodeJS.ReadableStream;
    getUrl(id: string): string;
    exists(id: string): Promise<boolean>;
    remove(id: string): Promise<void>;
}
