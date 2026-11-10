import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose";

const port = 8800;
const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(
  "mongodb+srv://mongo_user:yq8CO5is4OfmGDkb@cluster0.lkvgsgl.mongodb.net/",
);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return (res, status(401).send({ message: "Unauthorized!!!!!" }));
  }
  const token = authHeader.split(" ")[1];

  try {
    const JWKS = createRemoteJWKSet(
      new URL("http://localhost:3000/api/auth/jwks"),
    );
    const { payload } = await jwtVerify(token, JWKS);
  } catch (error) {
    return res.status(500).send("Server error");
  }

  next();
};

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("mongo_user");
const instructors = db.collection("instructors");

app.get("/instructor", verifyUser, async (req, res) => {
  const { limit } = req.query;
  //   console.log(name);

  const result = await instructors.find().sort({ students: -1 }).toArray();
  res.send(result);
});

app.post("/instructor", async (req, res) => {
  const body = req.body;
  const result = instructors.insertOne(body);
  res.send(result);
});

app.patch("/instructor/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  //   console.log(updatedData);
  const result = await instructors.updateOne(
    {
      _id: new ObjectId(id),
    },
    { $set: { name: "ffdfff" } },
  );
  console.log(result);

  //   const result = instructors.insertOne(body);
  res.send(result);
});

app.patch("/api/instructor/:id", async (req, res) => {
  const { id } = req.params;
  const result = await instructors.updateOne(
    {
      _id: new ObjectId(id),
    },
    { $inc: { students: 1 } },
  );
  console.log(result);

  //   const result = instructors.insertOne(body);
  res.send(result);
});

app.delete("/instructor/:id", async (req, res) => {
  const { id } = req.params;

  const result = await instructors.deleteOne({
    _id: new ObjectId(id),
  });
  console.log(result);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send({
    message: "Server is running",
  });
});

app.listen(port, () => {
  console.log({
    message: "Server is running on 8800",
  });
});
