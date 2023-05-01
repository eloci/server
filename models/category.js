import mongoose from "mongoose";

const schema = new mongoose.Schema({
    category:{
        type: String,
        required:[true,"Please enter Category"],
    },
});

export const Category = mongoose.model("Category", schema);
