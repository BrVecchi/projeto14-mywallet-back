import db from "../src/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";
import joi from "joi";

const usersCollection = db.collection("users");
const sessionsCollection = db.collection("sessions");

const newUserSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().required(),
  password: joi.string().required(),
});

const userSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

export const signUp = async (req, res) => {
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
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  const validation = userSchema.validate(
    { email, password },
    { abortEarly: false }
  );
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }

  try {
    const token = uuidV4();

    const { email } = req.body;
    const userValidation = await usersCollection.findOne({ email });
    if (!userValidation) {
      res.sendStatus(401);
      return;
    }
    const passwordOk = bcrypt.compareSync(password, userValidation.password);
    if (!passwordOk) {
      return res.sendStatus(401);
    }

    const result = await sessionsCollection.insertOne({
      token,
      userId: userValidation._id,
      name: userValidation.name,
    });
    res.send({ token, name: userValidation.name });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
