import mongoose, { Model } from 'mongoose';

export interface IDatabase {
    find(q: db_function): Promise<any>;
    findOne(q: db_function): Promise<any>;
    insertOne(q: db_function): Promise<any>;
    insertMany(q: db_function): Promise<mongoose.MergeType<any, Omit<any, '_id'>>[]>;
    updateOne(q: db_function): Promise<any>;
    updateMany(q: db_function): Promise<any>;
    distinct(q: db_function): Promise<any>;
    aggregate(q: db_function): Promise<any[]>;
    countDocuments(q: db_function): Promise<any>;
    findByIdAndUpdate(q: db_function): Promise<any>;
    save(q: db_function): Promise<any>;
    findByIdAndDelete(q: db_function): Promise<any>;
    findOneAndUpdate(q: db_function): Promise<any>;
    exists(q: db_function): Promise<any>;
    findOneAndDelete(q: db_function): Promise<any>;
    deleteOne(q: db_function): Promise<any>;
    deleteMany(q: db_function): Promise<any>;
}

export interface db_function {
    [key: string]: any;
    collection: string;
    query?: any;
    options?: any;
    project?: any;
    limit?: number;
    skip?: number;
    populate?: any;
    sort?: any;
    time?: any;
    value?: any;
    id?: any;
    update?: any;
    document?: any;
    documents?: any;
    pipeline?: any;
}

export interface Schema {
    [key: string]: mongoose.Model<any, any>;
}
