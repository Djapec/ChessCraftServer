import mongoose from "mongoose";
import {db_function, IDatabase, Schema} from "./database.interfaces.js";


const ObjectId = mongoose.Types.ObjectId;

export class Database implements IDatabase {
    public constructor(
        private connection: mongoose.Mongoose,
        private schemas: Schema
    ) {}

    async find({ collection, query, project, limit, skip, populate, sort }: db_function) {
        return await this.schemas[collection]
            .find(query, project)
            .limit(limit)
            .sort(sort)
            .skip(skip)
            .populate(populate)
            .lean();
    }

    async findOne({ collection, query, project, populate, sort }: db_function) {
        return await this.schemas[collection].findOne(query, project).sort(sort).populate(populate).lean();
    }

    async insertOne({ collection, document, options }: db_function) {
        return await this.schemas[collection].create(document);
    }

    async insertMany({ collection, documents }: db_function) {
        return await this.schemas[collection].insertMany(documents);
    }

    async updateOne({ collection, query, update }: db_function) {
        return this.schemas[collection].updateOne(query, update);
    }

    async updateMany({ collection, query, update, options }: db_function) {
        return this.schemas[collection].updateMany(query, update, options);
    }

    async deleteOne({ collection, query }: db_function) {
        return this.schemas[collection].deleteOne(query);
    }

    async deleteMany({ collection, query }: db_function) {
        return this.schemas[collection].deleteMany(query);
    }

    async distinct({ collection, field, query }: db_function) {
        return this.schemas[collection].distinct(field, query);
    }

    async aggregate({ collection, pipeline }: db_function) {
        return this.schemas[collection].aggregate(pipeline);
    }

    async countDocuments({ collection, query }: db_function) {
        return this.schemas[collection].countDocuments(query);
    }

    async findByIdAndUpdate({ collection, id, update }: db_function): Promise<any> {
        return this.schemas[collection].findByIdAndUpdate(
            { _id: typeof id === 'number' ? ObjectId.createFromTime(id) : new ObjectId(id) },
            update
        );
    }

    async findByIdAndDelete({ collection, id }: db_function): Promise<any> {
        return this.schemas[collection].deleteOne(
            { _id: typeof id === 'number' ? ObjectId.createFromTime(id) : new ObjectId(id) }
        );
    }

    async save({ document }: db_function) {
        return await document.save();
    }

    async findOneAndUpdate({ collection, query, update, options }: db_function) {
        return await this.schemas[collection].findOneAndUpdate(query, update, options).lean();
    }

    async exists({ collection, query }: db_function) {
        return this.schemas[collection].exists(query);
    }

    async findOneAndDelete({ collection, query, options }: db_function) {
        return this.schemas[collection].findOneAndDelete(query, options);
    }
}
