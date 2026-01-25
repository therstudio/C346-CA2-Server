/********************** Required Packages *************************/
const express = require("express");
const mysql = require("mysql2/promise");
const multer = require("multer");
require("dotenv").config();
const PORT = 3000;

/********************** Database Config ***************************/
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

/********************** Initialize Express App *********************/
const app = express();
app.use(express.json());

/********************** Multer Upload *****************************/
const upload = multer({ dest: "uploads/" });
app.use("/uploads", express.static("uploads"));

/********************** Start Server ******************************/
app.listen(PORT, () => console.log("Server running on port", PORT));

/********************** USERS CRUD ********************************/

// ------- GET ROUTE -------
app.get("/users", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.get("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM users WHERE id=?", [
      userId,
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// ------- CREATE ROUTE -------
app.post("/users", async (req, res) => {
  const { username, name, email, password, phone } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO users (username, name, email, password, phone) VALUES (?,?,?,?,?)",
      [username, name, email, password, phone],
    );
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to create user" });
  }
});

// ------- UPDATE ROUTE -------
app.put("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, name, email, password, phone } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "UPDATE users SET username=?, name=?, email=?, password=?, phone=? WHERE id=?",
      [username, name, email, password, phone, userId],
    );
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// ------- DELETE ROUTE -------
app.delete("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute("DELETE FROM users WHERE id=?", [userId]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ------- LOGIN ROUTE (Simple) -------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email=? AND password=?",
      [email, password],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// ------- UPLOAD AVATAR -------
app.post("/users/:id/avatar", upload.single("image"), async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute("UPDATE users SET avatar=? WHERE id=?", [
      req.file.filename,
      userId,
    ]);
    res.status(201).json({
      message: "Avatar uploaded",
      avatarUrl: "/uploads/" + req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ message: "Avatar upload failed" });
  }
});

/********************** COMMUTES CRUD ******************************/

// ------- GET ROUTE -------
app.get("/commutes", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM commutes ORDER BY start_time DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch commutes" });
  }
});

app.get("/commutes/:id", async (req, res) => {
  const commuteId = parseInt(req.params.id);
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM commutes WHERE id=?",
      [commuteId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch commute" });
  }
});

// ------- CREATE ROUTE -------
app.post("/commutes", async (req, res) => {
  const {
    user_id,
    from_label,
    to_label,
    mode,
    start_time,
    end_time,
    duration_min,
    purpose,
    notes,
    start_lat,
    start_lng,
    end_lat,
    end_lng,
    distance_km,
  } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO commutes (user_id, from_label, to_label, mode, start_time, end_time, duration_min, purpose, notes, start_lat, start_lng, end_lat, end_lng, distance_km) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        user_id,
        from_label,
        to_label,
        mode,
        start_time,
        end_time,
        duration_min,
        purpose,
        notes,
        start_lat,
        start_lng,
        end_lat,
        end_lng,
        distance_km,
      ],
    );
    res.status(201).json({ message: "Commute created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to create commute" });
  }
});

// ------- UPDATE ROUTE -------
app.put("/commutes/:id", async (req, res) => {
  const commuteId = parseInt(req.params.id);
  const {
    user_id,
    from_label,
    to_label,
    mode,
    start_time,
    end_time,
    duration_min,
    purpose,
    notes,
    start_lat,
    start_lng,
    end_lat,
    end_lng,
    distance_km,
  } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "UPDATE commutes SET user_id=?, from_label=?, to_label=?, mode=?, start_time=?, end_time=?, duration_min=?, purpose=?, notes=?, start_lat=?, start_lng=?, end_lat=?, end_lng=?, distance_km=? WHERE id=?",
      [
        user_id,
        from_label,
        to_label,
        mode,
        start_time,
        end_time,
        duration_min,
        purpose,
        notes,
        start_lat,
        start_lng,
        end_lat,
        end_lng,
        distance_km,
        commuteId,
      ],
    );
    res.json({ message: "Commute updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update commute" });
  }
});

// ------- DELETE ROUTE -------
app.delete("/commutes/:id", async (req, res) => {
  const commuteId = parseInt(req.params.id);

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute("DELETE FROM commutes WHERE id=?", [commuteId]);
    res.json({ message: "Commute deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete commute" });
  }
});

/********************** COMMUTE IMAGES ****************************/

// ------- UPLOAD COMMUTE IMAGE -------
app.post("/commutes/:id/image", upload.single("image"), async (req, res) => {
  const commuteId = parseInt(req.params.id);
  const userId = req.body.user_id;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO commute_images (commute_id, user_id, file_name, file_path) VALUES (?,?,?,?)",
      [commuteId, userId, req.file.originalname, req.file.filename],
    );

    res.status(201).json({
      message: "Image uploaded",
      imageUrl: "/uploads/" + req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload image" });
  }
});

// ------- GET COMMUTE IMAGES -------
app.get("/commutes/:id/image", async (req, res) => {
  const commuteId = parseInt(req.params.id);

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM commute_images WHERE commute_id=?",
      [commuteId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch images" });
  }
});
