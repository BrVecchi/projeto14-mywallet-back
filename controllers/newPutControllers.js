import db from "../src/db.js";

const usersCollection = db.collection("users");
const recordsColletcion = db.collection("records");
const sessionsCollection = db.collection("sessions");

export const newInput = async (req, res) => {
  const { date, description, value, status } = req.body;
  const token = req.token;

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
  const token = req.token;

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
