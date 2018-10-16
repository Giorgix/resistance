import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.

const ActionsSchema = new Schema(
  {
    title: String,
    text: String,
    image: String,
    owner: String,
    likedBy: [String],
    comments: [{ body: String, date: Date, userId: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Action", ActionsSchema);
