import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
dotenv.config();

// SCHEMAS
const newUserSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().required(),
  password: joi.string().required(),
});

const userSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

const token = uuid();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

await mongoClient.connect();
db = mongoClient.db("my-wallet");

const usersCollection = db.collection("users");
const messagesCollection = db.collection("messages");
const sessionsCollection = db.collection("sessions");

const app = express();
app.use(express.json());
app.use(cors());

// POST SIGN UP
app.post("/sign-up", async (req, res) => {
  const user = req.body;

  const validation = newUserSchema.validate(user, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }

  try {
    const { email } = req.body;
    const emailValidation = await usersCollection.findOne({ email: email });

    if (emailValidation) {
      res.sendStatus(409);
      return;
    }

    const hashPassword = bcrypt.hashSync(user.password, 10);

    await usersCollection.insertOne({ ...user, password: hashPassword });
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// POST SIGN IN
app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  const validation = userSchema.validate(user, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }

  try {
    const token = V4();

    const { email } = req.body;
    const userValidation = await usersCollection.findOne({ email: email });
    if (!userValidation) {
      res.sendStatus(401);
      return;
    }
    const passwordOk = bcrypt.compareSync(password, userValidation.password);
    if (!password) {
      return res.sendStatus(401);
    }

    await usersCollection.insertOne({token, userId: userValidation._id});
    res.send({token});
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(5000);
console.log("Rodando na porta 5000");
