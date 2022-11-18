import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi"
import dayjs from 'dayjs';
dotenv.config();



const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

await mongoClient.connect();
db = mongoClient.db("my-wallet");

const app = express();
app.use(express.json());
app.use(cors());


app.listen(5000);
console.log("Rodando na porta 5000")
