import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi";
import dayjs from "dayjs";
import { v4 as uuidV4 } from "uuid";
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

const newPutsSchema = joi.object({
  date: joi.string().required(),
  description: joi.string().required(),
  value: joi.number().required(),
  status: joi.string().required()
})

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

await mongoClient.connect();
db = mongoClient.db("my-wallet");

const usersCollection = db.collection("users");
const recordsColletcion = db.collection("records");
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
    const emailValidation = await usersCollection.findOne({ email });

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

  const validation = userSchema.validate({email, password}, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }

  try {
    const token = uuidV4();

    const { email } = req.body;
    const userValidation = await usersCollection.findOne({ email: email });
    if (!userValidation) {
      res.sendStatus(401);
      return;
    }
    const passwordOk = bcrypt.compareSync(password, userValidation.password);
    if (!passwordOk) {
      return res.sendStatus(401);
    }

    await sessionsCollection.insertOne({token, userId: userValidation._id});
    res.send({token});
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// POST NEW INPUT
app.post("/new-input", async (req, res) => {
  const { date, description, value, status} = req.body;
  const { authorization } = req.headers;

  const validation = newPutsSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const session = await sessionsCollection.findOne({ token: token });
    const user = await usersCollection.findOne({ _id: session?.userId });
    console.log(session)
    console.log(typeof(token))

    if (!user) {
      return res.sendStatus(401);
    }

    await recordsColletcion.insertOne({
      date,
      description,
      value,
      status,
      userId: user._id,
    });

    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// POST NEW OUTPUT
app.post("/new-output", async (req, res) => {
  const { date, description, value, status} = req.body;
  const { authorization } = req.headers;

  const validation = newPutsSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
  console.log(token)
    const session = await sessionsCollection.findOne({ token });
    const user = await usersCollection.findOne({ _id: session?.userId });

    if (!user) {
      return res.sendStatus(401);
    }

    await recordsColletcion.insertOne({
      date,
      description,
      value,
      status,
      userId: user._id,
    });

    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// GET RECORDS
app.get("/records", async (req, res) => {
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const posts = await recordsColletcion.find().toArray();
    res.send(posts);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(5000);
console.log("Rodando na porta 5000");
