import { BaseModel } from './baseTypes';

export interface StorageFile extends BaseModel {
    name: string;
    group: string;
    description: string;
    tags: string[];
    file: string;
    size: number;
    thumbnail: string | null;
}

export interface ShareToken extends BaseModel {
    file: string;
    is_active: boolean;
    shared_until: string | null;
    password: string | null;
    token: string;
}