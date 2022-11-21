import db from "../src/db.js";
import joi from "joi";

const usersCollection = db.collection("users");
const recordsColletcion = db.collection("records");
const sessionsCollection = db.collection("sessions");

const newPutsSchema = joi.object({
    date: joi.string().required(),
    description: joi.string().required(),
    value: joi.number().required(),
    status: joi.string().required(),
  });

export const newInput = async (req, res) => {
  const { date, description, value, status } = req.body;
  const { authorization } = req.headers;

  const validation = newPutsSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(409);
  }

  try {
    const session = await sessionsCollection.findOne({ token });
    const user = await usersCollection.findOne({ _id: session?.userId });
    console.log(session);
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
};

export const newOutput = async (req, res) => {
  const { date, description, value, status } = req.body;
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
};
