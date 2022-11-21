import db from "../src/db.js";

const recordsColletcion = db.collection("records");
const sessionsCollection = db.collection("sessions");

export const getRecords = async (req, res) => {
  const token = req.token;
  console.log(token)
  try {
    const session = await sessionsCollection.findOne({ token });
    const userId = session.userId;
    const records = await recordsColletcion.find({ userId }).toArray();
    res.send(records);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
