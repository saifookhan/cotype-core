import * as Cotype from "../../../typings";
import { Migration } from "../ContentPersistence";
import { Data, MetaData, ListOpts } from "../../../typings";
type StoreAndSearchData = {
    storeData: Data;
    searchData: Data;
};
export type RewriteIterator = (data: Data, meta: MetaData) => Promise<void | StoreAndSearchData>;
export interface SettingsAdapter {
    create(model: Cotype.Model, data: object): Promise<string>;
    load(model: Cotype.Model, id: string): Promise<Cotype.Settings>;
    find(model: Cotype.Model, field: string, value: any): Promise<Cotype.Settings>;
    list(model: Cotype.Model, opts: Cotype.ListOpts): Promise<Cotype.ListChunk<Cotype.Settings>>;
    update(model: Cotype.Model, id: string, data: object): Promise<void>;
    delete(model: Cotype.Model, id: string): Promise<any>;
    deleteUser(id: string): Promise<any>;
    findUserByEmail(id: string): Promise<Cotype.Settings>;
    loadUser(id: string): Promise<Cotype.User>;
}
export interface ContentAdapter {
    create(storeData: Cotype.Data, indexData: Cotype.Data, model: Cotype.Model, models: Cotype.Model[], author: string): Promise<string>;
    createRevision(storeData: Cotype.Data, indexData: Cotype.Data, model: Cotype.Model, models: Cotype.Model[], id: string, author: string): Promise<number>;
    findByMedia(media: string): Promise<any[]>;
    list(model: Cotype.Model, models: Cotype.Model[], listOpts?: Cotype.ListOpts, criteria?: Cotype.Criteria, previewOpts?: Cotype.PreviewOpts): Promise<Cotype.ListChunk<Cotype.Content>>;
    load(model: Cotype.Model, id: string, previewOpts?: Cotype.PreviewOpts): Promise<Cotype.Content | null>;
    loadContentReferences(ids: string[], model: Cotype.Model, models: Cotype.Model[], previewOpts?: Cotype.PreviewOpts, join?: Cotype.Join[]): Promise<Cotype.Data[]>;
    loadMediaFromContents(ids: string[], published?: boolean): Promise<Cotype.Meta[]>;
    loadRevision(model: Cotype.Model, id: string, rev: number): Promise<Cotype.Revision>;
    listVersions(model: Cotype.Model, id: string): Promise<(Cotype.VersionItem & {
        published: boolean;
    })[]>;
    setPublishedRev(model: Cotype.Model, id: string, published: number | null, models: Cotype.Model[]): Promise<any>;
    schedule(model: Cotype.Model, id: string, schedule: Cotype.Schedule): Promise<void>;
    delete(model: Cotype.Model, id: string): Promise<any>;
    search(term: string, exact: boolean, opts: Cotype.ListOpts, previewOpts?: Cotype.PreviewOpts): Promise<Cotype.ListChunk<Cotype.Content>>;
    rewrite(model: Cotype.Model, models: Cotype.Model[], iterator: RewriteIterator): Promise<void>;
    migrate(migrations: Migration[], callback: (adapter: ContentAdapter, outstanding: Migration[]) => Promise<void>): Promise<any>;
    listLastUpdatedContent(models: string[], opts: ListOpts, user?: string): Promise<Cotype.ListChunk<Cotype.Content>>;
    listUnpublishedContent(models: string[], opts: ListOpts): Promise<Cotype.ListChunk<Cotype.Content>>;
}
export interface MediaAdapter {
    create(meta: Cotype.Meta): Promise<void>;
    list(opts: Cotype.MediaListOpts): Promise<Cotype.ListChunk<Cotype.Media>>;
    load(id: string[]): Promise<Cotype.Media[]>;
    findByHash(hashes: string[]): Promise<Cotype.Media[]>;
    update(id: string, data: Cotype.Media): Promise<boolean>;
    delete(id: string, models: Cotype.Model[]): Promise<void>;
}
export interface PersistenceAdapter {
    settings: SettingsAdapter;
    content: ContentAdapter;
    media: MediaAdapter;
    shutdown(): void | Promise<any>;
}
export {};
