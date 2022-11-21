import db from "../src/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";

const usersCollection = db.collection("users");
const sessionsCollection = db.collection("sessions");

export const signUp = async (req, res) => {
  const user = req.body;

  try {
    const hashPassword = bcrypt.hashSync(user.password, 10);

    await usersCollection.insertOne({ ...user, password: hashPassword });
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

export const signIn = async (req, res) => {
  const { password } = req.body;

  try {
    const token = uuidV4();
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
