import { MongoClient } from "mongodb";
import { MONGO_DATABASE, MONGO_URI } from "../env";

export const client = new MongoClient(MONGO_URI);
export const mongoDB = client.db(MONGO_DATABASE);

export const mongo = {
  logConnect: mongoDB.collection("logConnect"),
  content: mongoDB.collection("content"),
  exam: mongoDB.collection("exam"),
};

(async () => {
  await mongo.logConnect.insertOne({ date: new Date() });
  console.log("MongoDB connect whit success");
})();
