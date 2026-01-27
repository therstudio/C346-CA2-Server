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
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT id, username, name, email, phone, image FROM users",
    );

    res.json(rows);
  } catch (err) {
    console.log("GET /users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  } finally {
    if (connection) await connection.end();
  }
});

app.get("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT id, username, name, email, phone, image FROM users WHERE id=?",
      [userId],
    );

    res.json(rows);
  } catch (err) {
    console.log("GET /users/:id error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  } finally {
    if (connection) await connection.end();
  }
});

// ------- CREATE ROUTE -------
app.post("/users", async (req, res) => {
  const { username, name, email, password, phone } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO users (username, name, email, password, phone) VALUES (?,?,?,SHA1(?),?)",
      [username, name, email, password, phone],
    );
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log("POST /users error:", err);
    res.status(500).json({ message: "Failed to create user" });
  } finally {
    if (connection) await connection.end();
  }
});

// ------- UPDATE ROUTE -------
app.put("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, name, email, password, phone } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    if (password && String(password).trim().length > 0) {
      await connection.execute(
        "UPDATE users SET username=?, name=?, email=?, password=SHA1(?), phone=? WHERE id=?",
        [username, name, email, password, phone, userId],
      );
    } else {
      await connection.execute(
        "UPDATE users SET username=?, name=?, email=?, phone=? WHERE id=?",
        [username, name, email, phone, userId],
      );
    }

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.log("PUT /users/:id error:", err);
    res.status(500).json({ message: "Failed to update user" });
  } finally {
    if (connection) await connection.end();
  }
});

// ------- DELETE ROUTE -------
app.delete("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute("DELETE FROM users WHERE id=?", [userId]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.log("DELETE /users/:id error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  } finally {
    if (connection) await connection.end();
  }
});

// ------- LOGIN ROUTE -------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT id, username, name, email, phone, image FROM users WHERE email=? AND password=SHA1(?)",
      [email, password],
    );

    res.json(rows);
  } catch (err) {
    console.log("POST /login error:", err);
    res.status(500).json({ message: "Login failed" });
  } finally {
    if (connection) await connection.end();
  }
});

// ------- UPLOAD AVATAR -------

app.post("/users/:id/avatar", upload.single("image"), async (req, res) => {
  const userId = parseInt(req.params.id);
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    let image = null;
    if (req.file) image = req.file.filename;

    await connection.execute("UPDATE users SET image=? WHERE id=?", [
      image,
      userId,
    ]);

    res.status(201).json({
      message: "Avatar uploaded",
      avatarUrl: image ? "/uploads/" + image : null,
      imageUrl: image ? "/uploads/" + image : null,
    });
  } catch (err) {
    console.log("POST /users/:id/avatar error:", err);
    res.status(500).json({ message: "Avatar upload failed" });
  } finally {
    if (connection) await connection.end();
  }
});

/********************** COMMUTES CRUD ******************************/

function mustUserId(req, res) {
  const userId = parseInt(req.query.user_id);
  if (!userId) {
    res.status(400).json({ message: "Missing user_id" });
    return null;
  }
  return userId;
}

// ------- GET ROUTE -------
// Get commutes for ONE user only
app.get("/commutes", async (req, res) => {
  const userId = mustUserId(req, res);
  if (!userId) return;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM commutes WHERE user_id=? ORDER BY start_time DESC",
      [userId],
    );
    res.json(rows);
  } catch (err) {
    console.log("GET /commutes error:", err);
    res.status(500).json({ message: "Failed to fetch commutes" });
  } finally {
    if (connection) await connection.end();
  }
});

// Get ONE commute only if it belongs to the user
app.get("/commutes/:id", async (req, res) => {
  const commuteId = parseInt(req.params.id);
  const userId = mustUserId(req, res);
  if (!userId) return;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM commutes WHERE id=? AND user_id=?",
      [commuteId, userId],
    );
    res.json(rows);
  } catch (err) {
    console.log("GET /commutes/:id error:", err);
    res.status(500).json({ message: "Failed to fetch commute" });
  } finally {
    if (connection) await connection.end();
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

  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
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

    res.status(201).json({
      message: "Commute created successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.log("POST /commutes error:", err);
    res.status(500).json({ message: "Failed to create commute" });
  } finally {
    if (connection) await connection.end();
  }
});

// ------- UPDATE ROUTE -------
app.put("/commutes/:id", async (req, res) => {
  const commuteId = parseInt(req.params.id);
  const userId = mustUserId(req, res);
  if (!userId) return;

  const {
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

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "UPDATE commutes SET from_label=?, to_label=?, mode=?, start_time=?, end_time=?, duration_min=?, purpose=?, notes=?, start_lat=?, start_lng=?, end_lat=?, end_lng=?, distance_km=? WHERE id=? AND user_id=?",
      [
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
        userId,
      ],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Commute not found (or not owned by user)" });
    }

    res.json({ message: "Commute updated successfully" });
  } catch (err) {
    console.log("PUT /commutes/:id error:", err);
    res.status(500).json({ message: "Failed to update commute" });
  } finally {
    if (connection) await connection.end();
  }
});

// ------- DELETE ROUTE -------
app.delete("/commutes/:id", async (req, res) => {
  const commuteId = parseInt(req.params.id);
  const userId = mustUserId(req, res);
  if (!userId) return;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "DELETE FROM commutes WHERE id=? AND user_id=?",
      [commuteId, userId],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Commute not found (or not owned by user)" });
    }

    res.json({ message: "Commute deleted successfully" });
  } catch (err) {
    console.log("DELETE /commutes/:id error:", err);
    res.status(500).json({ message: "Failed to delete commute" });
  } finally {
    if (connection) await connection.end();
  }
});

/********************** COMMUTE IMAGE ****************************/

function mustUserIdBody(req, res) {
  const userId = parseInt(req.body.user_id);
  if (!userId) {
    res.status(400).json({ message: "Missing user_id" });
    return null;
  }
  return userId;
}

// ------- UPLOAD COMMUTE IMAGE -------
app.post("/commutes/:id/image", upload.single("image"), async (req, res) => {
  const commuteId = parseInt(req.params.id);
  const userId = mustUserIdBody(req, res);
  if (!userId) return;

  if (!req.file) {
    return res.status(400).json({ message: "Missing image file" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [ownRows] = await connection.execute(
      "SELECT id FROM commutes WHERE id=? AND user_id=?",
      [commuteId, userId],
    );
    if (ownRows.length < 1) {
      return res
        .status(404)
        .json({ message: "Commute not found (or not owned by user)" });
    }

    const image = req.file.filename;

    await connection.execute(
      "UPDATE commutes SET image=? WHERE id=? AND user_id=?",
      [image, commuteId, userId],
    );

    res.status(201).json({
      message: "Image uploaded",
      imageUrl: "/uploads/" + image,
      file_path: image,
      file_name: req.file.originalname || null,
    });
  } catch (err) {
    console.log("POST /commutes/:id/image error:", err);
    res.status(500).json({ message: "Failed to upload image" });
  } finally {
    if (connection) await connection.end();
  }
});

// ------- GET COMMUTE IMAGE -------
app.get("/commutes/:id/image", async (req, res) => {
  const commuteId = parseInt(req.params.id);
  const userId = mustUserId(req, res);
  if (!userId) return;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT image FROM commutes WHERE id=? AND user_id=?",
      [commuteId, userId],
    );

    if (rows.length < 1) {
      return res
        .status(404)
        .json({ message: "Commute not found (or not owned by user)" });
    }

    const image = rows[0].image;

    res.json({
      imageUrl: image ? "/uploads/" + image : null,
      file_path: image ? image : null,
      file_name: null,
    });
  } catch (err) {
    console.log("GET /commutes/:id/image error:", err);
    res.status(500).json({ message: "Failed to fetch image" });
  } finally {
    if (connection) await connection.end();
  }
});
