const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const { body, validationResult } = require("express-validator")

// Carica le variabili d'ambiente
dotenv.config()

// Inizializza l'app Express
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Connessione a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connessione a MongoDB stabilita"))
  .catch((err) => console.error("Errore di connessione a MongoDB:", err))

// Modelli
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    notifications: { type: Boolean, default: true },
    expiryAlerts: { type: Boolean, default: true },
    recipeSuggestions: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
})

const recipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: "/placeholder.svg?height=300&width=400" },
  time: { type: String, required: true },
  difficulty: { type: String, required: true },
  ingredients: [
    {
      name: { type: String, required: true },
      quantity: { type: String, required: true },
    },
  ],
  steps: [{ type: String, required: true }],
  notes: { type: String },
  favorite: { type: Boolean, default: false },
  personal: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

const shoppingItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  checked: { type: Boolean, default: false },
  fromRecipe: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const pantryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  category: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  isExpired: { type: Boolean, default: false },
  isExpiringSoon: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: "generale" },
  createdAt: { type: Date, default: Date.now },
})

const dietPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  userData: {
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    activityLevel: { type: String, required: true },
    goal: { type: String, required: true },
    preferences: [{ type: String }],
    restrictions: [{ type: String }],
  },
  results: {
    bmi: { type: Number, required: true },
    bmiCategory: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
  },
  mealPlan: [
    {
      day: { type: Number, required: true },
      meals: [
        {
          type: { type: String, required: true },
          name: { type: String, required: true },
          ingredients: [{ type: String, required: true }],
          calories: { type: Number, required: true },
          protein: { type: Number, required: true },
          carbs: { type: Number, required: true },
          fat: { type: Number, required: true },
        },
      ],
    },
  ],
  tips: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
})

// Crea i modelli
const User = mongoose.model("User", userSchema)
const Recipe = mongoose.model("Recipe", recipeSchema)
const ShoppingItem = mongoose.model("ShoppingItem", shoppingItemSchema)
const PantryItem = mongoose.model("PantryItem", pantryItemSchema)
const Note = mongoose.model("Note", noteSchema)
const DietPlan = mongoose.model("DietPlan", dietPlanSchema)

// Middleware di autenticazione
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ error: "Autenticazione richiesta" })
  }
}

// Rotte per l'autenticazione
app.post(
  "/api/auth/register",
  [
    body("name").notEmpty().withMessage("Il nome è obbligatorio"),
    body("email").isEmail().withMessage("Email non valida"),
    body("password").isLength({ min: 6 }).withMessage("La password deve essere di almeno 6 caratteri"),
  ],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { name, email, password } = req.body

      // Verifica se l'utente esiste già
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ error: "Email già registrata" })
      }

      // Hash della password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Crea un nuovo utente
      const user = new User({
        name,
        email,
        password: hashedPassword,
      })

      await user.save()
      console.log("Utente salvato:", user)

      // Genera token JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      })
    } catch (error) {
      console.error("Errore durante la registrazione:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

app.post(
  "/api/auth/login",
  [
    body("email").isEmail().withMessage("Email non valida"),
    body("password").notEmpty().withMessage("Password obbligatoria"),
  ],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { email, password } = req.body

      // Trova l'utente
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({ error: "Credenziali non valide" })
      }

      // Verifica la password
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(401).json({ error: "Credenziali non valide" })
      }

      // Genera token JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences,
        },
      })
    } catch (error) {
      console.error("Errore durante il login:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

// Rotte per il profilo utente
app.get("/api/user/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" })
    }
    res.json(user)
  } catch (error) {
    console.error("Errore durante il recupero del profilo:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.put(
  "/api/user/profile",
  auth,
  [
    body("name").notEmpty().withMessage("Il nome è obbligatorio"),
    body("email").isEmail().withMessage("Email non valida"),
  ],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { name, email, preferences } = req.body

      // Verifica se l'email è già in uso da un altro utente
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } })
      if (existingUser) {
        return res.status(400).json({ error: "Email già in uso" })
      }

      // Aggiorna il profilo
      const user = await User.findByIdAndUpdate(req.userId, { name, email, preferences }, { new: true }).select(
        "-password",
      )

      if (!user) {
        return res.status(404).json({ error: "Utente non trovato" })
      }

      res.json(user)
    } catch (error) {
      console.error("Errore durante l'aggiornamento del profilo:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

app.put(
  "/api/user/password",
  auth,
  [
    body("currentPassword").notEmpty().withMessage("Password attuale obbligatoria"),
    body("newPassword").isLength({ min: 6 }).withMessage("La nuova password deve essere di almeno 6 caratteri"),
  ],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { currentPassword, newPassword } = req.body

      // Trova l'utente
      const user = await User.findById(req.userId)
      if (!user) {
        return res.status(404).json({ error: "Utente non trovato" })
      }

      // Verifica la password attuale
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return res.status(401).json({ error: "Password attuale non valida" })
      }

      // Hash della nuova password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Aggiorna la password
      user.password = hashedPassword
      await user.save()

      res.json({ message: "Password aggiornata con successo" })
    } catch (error) {
      console.error("Errore durante l'aggiornamento della password:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

// Rotte per le ricette
app.get("/api/recipes", auth, async (req, res) => {
  try {
    const { query, favorite, personal } = req.query

    // Costruisci il filtro
    const filter = { userId: req.userId }

    if (query) {
      filter.$or = [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }]
    }

    if (favorite === "true") {
      filter.favorite = true
    }

    if (personal === "true") {
      filter.personal = true
    }

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 })
    res.json(recipes)
  } catch (error) {
    console.error("Errore durante il recupero delle ricette:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.get("/api/recipes/:id", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.userId })

    if (!recipe) {
      return res.status(404).json({ error: "Ricetta non trovata" })
    }

    res.json(recipe)
  } catch (error) {
    console.error("Errore durante il recupero della ricetta:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.post(
  "/api/recipes",
  auth,
  [
    body("title").notEmpty().withMessage("Il titolo è obbligatorio"),
    body("description").notEmpty().withMessage("La descrizione è obbligatoria"),
    body("time").notEmpty().withMessage("Il tempo è obbligatorio"),
    body("difficulty").notEmpty().withMessage("La difficoltà è obbligatoria"),
    body("ingredients").isArray().withMessage("Gli ingredienti devono essere un array"),
    body("steps").isArray().withMessage("I passaggi devono essere un array"),
  ],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { title, description, image, time, difficulty, ingredients, steps, notes, favorite, personal } = req.body

      // Crea una nuova ricetta
      const recipe = new Recipe({
        userId: req.userId,
        title,
        description,
        image: image || "/placeholder.svg?height=300&width=400",
        time,
        difficulty,
        ingredients,
        steps,
        notes,
        favorite: favorite || false,
        personal: personal !== undefined ? personal : true,
      })

      await recipe.save()
      res.status(201).json(recipe)
    } catch (error) {
      console.error("Errore durante la creazione della ricetta:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

app.put("/api/recipes/:id", auth, async (req, res) => {
  try {
    const { title, description, image, time, difficulty, ingredients, steps, notes, favorite } = req.body

    // Trova e aggiorna la ricetta
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, description, image, time, difficulty, ingredients, steps, notes, favorite },
      { new: true },
    )

    if (!recipe) {
      return res.status(404).json({ error: "Ricetta non trovata" })
    }

    res.json(recipe)
  } catch (error) {
    console.error("Errore durante l'aggiornamento della ricetta:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.patch("/api/recipes/:id/favorite", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.userId })

    if (!recipe) {
      return res.status(404).json({ error: "Ricetta non trovata" })
    }

    // Inverti lo stato preferito
    recipe.favorite = !recipe.favorite
    await recipe.save()

    res.json(recipe)
  } catch (error) {
    console.error("Errore durante l'aggiornamento dei preferiti:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.delete("/api/recipes/:id", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId: req.userId })

    if (!recipe) {
      return res.status(404).json({ error: "Ricetta non trovata" })
    }

    res.json({ message: "Ricetta eliminata con successo" })
  } catch (error) {
    console.error("Errore durante l'eliminazione della ricetta:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

// Rotte per la lista della spesa
app.get("/api/shopping-list", auth, async (req, res) => {
  try {
    const { fromRecipe, checked } = req.query

    // Costruisci il filtro
    const filter = { userId: req.userId }

    if (fromRecipe === "true") {
      filter.fromRecipe = { $exists: true, $ne: null }
    } else if (fromRecipe === "false") {
      filter.fromRecipe = { $exists: false }
    }

    if (checked === "true") {
      filter.checked = true
    } else if (checked === "false") {
      filter.checked = false
    }

    const items = await ShoppingItem.find(filter).sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    console.error("Errore durante il recupero della lista della spesa:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.post(
  "/api/shopping-list",
  auth,
  [body("name").notEmpty().withMessage("Il nome è obbligatorio")],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { name, quantity, fromRecipe } = req.body

      // Crea un nuovo elemento
      const item = new ShoppingItem({
        userId: req.userId,
        name,
        quantity: quantity || "1",
        fromRecipe,
      })

      await item.save()
      res.status(201).json(item)
    } catch (error) {
      console.error("Errore durante l'aggiunta dell'elemento alla lista della spesa:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

app.post(
  "/api/shopping-list/batch",
  auth,
  [body("items").isArray().withMessage("Gli elementi devono essere un array")],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { items, fromRecipe } = req.body

      // Crea gli elementi
      const newItems = items.map((item) => ({
        userId: req.userId,
        name: item.name,
        quantity: item.quantity || "1",
        fromRecipe,
      }))

      const savedItems = await ShoppingItem.insertMany(newItems)
      res.status(201).json(savedItems)
    } catch (error) {
      console.error("Errore durante l'aggiunta degli elementi alla lista della spesa:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

app.patch("/api/shopping-list/:id", auth, async (req, res) => {
  try {
    const { checked } = req.body

    // Trova e aggiorna l'elemento
    const item = await ShoppingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { checked },
      { new: true },
    )

    if (!item) {
      return res.status(404).json({ error: "Elemento non trovato" })
    }

    res.json(item)
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'elemento della lista della spesa:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.delete("/api/shopping-list/:id", auth, async (req, res) => {
  try {
    const item = await ShoppingItem.findOneAndDelete({ _id: req.params.id, userId: req.userId })

    if (!item) {
      return res.status(404).json({ error: "Elemento non trovato" })
    }

    res.json({ message: "Elemento eliminato con successo" })
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'elemento della lista della spesa:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.delete("/api/shopping-list", auth, async (req, res) => {
  try {
    const { checked } = req.query

    // Costruisci il filtro
    const filter = { userId: req.userId }

    if (checked === "true") {
      filter.checked = true
    }

    const result = await ShoppingItem.deleteMany(filter)
    res.json({ message: `${result.deletedCount} elementi eliminati con successo` })
  } catch (error) {
    console.error("Errore durante l'eliminazione degli elementi della lista della spesa:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

// Rotte per la dispensa
app.get("/api/pantry", auth, async (req, res) => {
  try {
    const { category, expired, expiringSoon } = req.query

    // Costruisci il filtro
    const filter = { userId: req.userId }

    if (category) {
      filter.category = category
    }

    if (expired === "true") {
      filter.isExpired = true
    }

    if (expiringSoon === "true") {
      filter.isExpiringSoon = true
    }

    const items = await PantryItem.find(filter).sort({ expiryDate: 1 })
    res.json(items)
  } catch (error) {
    console.error("Errore durante il recupero della dispensa:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.post(
  "/api/pantry",
  auth,
  [
    body("name").notEmpty().withMessage("Il nome è obbligatorio"),
    body("category").notEmpty().withMessage("La categoria è obbligatoria"),
    body("expiryDate").isISO8601().withMessage("Data di scadenza non valida"),
  ],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { name, quantity, category, expiryDate } = req.body

      // Calcola se il prodotto è scaduto o sta per scadere
      const today = new Date()
      const expiry = new Date(expiryDate)
      const isExpired = expiry < today

      // Considera "in scadenza" se mancano meno di 7 giorni
      const sevenDaysFromNow = new Date(today)
      sevenDaysFromNow.setDate(today.getDate() + 7)
      const isExpiringSoon = !isExpired && expiry < sevenDaysFromNow

      // Crea un nuovo elemento
      const item = new PantryItem({
        userId: req.userId,
        name,
        quantity: quantity || "1",
        category,
        expiryDate: expiry,
        isExpired,
        isExpiringSoon,
      })

      await item.save()
      res.status(201).json(item)
    } catch (error) {
      console.error("Errore durante l'aggiunta dell'elemento alla dispensa:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

app.put("/api/pantry/:id", auth, async (req, res) => {
  try {
    const { name, quantity, category, expiryDate } = req.body

    // Calcola se il prodotto è scaduto o sta per scadere
    const today = new Date()
    const expiry = new Date(expiryDate)
    const isExpired = expiry < today

    // Considera "in scadenza" se mancano meno di 7 giorni
    const sevenDaysFromNow = new Date(today)
    sevenDaysFromNow.setDate(today.getDate() + 7)
    const isExpiringSoon = !isExpired && expiry < sevenDaysFromNow

    // Trova e aggiorna l'elemento
    const item = await PantryItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, quantity, category, expiryDate: expiry, isExpired, isExpiringSoon },
      { new: true },
    )

    if (!item) {
      return res.status(404).json({ error: "Elemento non trovato" })
    }

    res.json(item)
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'elemento della dispensa:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.delete("/api/pantry/:id", auth, async (req, res) => {
  try {
    const item = await PantryItem.findOneAndDelete({ _id: req.params.id, userId: req.userId })

    if (!item) {
      return res.status(404).json({ error: "Elemento non trovato" })
    }

    res.json({ message: "Elemento eliminato con successo" })
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'elemento della dispensa:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

// Rotte per le note
app.get("/api/notes", auth, async (req, res) => {
  try {
    const { category, query } = req.query

    // Costruisci il filtro
    const filter = { userId: req.userId }

    if (category && category !== "tutte") {
      filter.category = category
    }

    if (query) {
      filter.$or = [{ title: { $regex: query, $options: "i" } }, { content: { $regex: query, $options: "i" } }]
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 })
    res.json(notes)
  } catch (error) {
    console.error("Errore durante il recupero delle note:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.post(
  "/api/notes",
  auth,
  [
    body("title").notEmpty().withMessage("Il titolo è obbligatorio"),
    body("content").notEmpty().withMessage("Il contenuto è obbligatorio"),
  ],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { title, content, category } = req.body

      // Crea una nuova nota
      const note = new Note({
        userId: req.userId,
        title,
        content,
        category: category || "generale",
      })

      await note.save()
      res.status(201).json(note)
    } catch (error) {
      console.error("Errore durante la creazione della nota:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

app.put(
  "/api/notes/:id",
  auth,
  [
    body("title").notEmpty().withMessage("Il titolo è obbligatorio"),
    body("content").notEmpty().withMessage("Il contenuto è obbligatorio"),
  ],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { title, content, category } = req.body

      // Trova e aggiorna la nota
      const note = await Note.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { title, content, category },
        { new: true },
      )

      if (!note) {
        return res.status(404).json({ error: "Nota non trovata" })
      }

      res.json(note)
    } catch (error) {
      console.error("Errore durante l'aggiornamento della nota:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

app.delete("/api/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId })

    if (!note) {
      return res.status(404).json({ error: "Nota non trovata" })
    }

    res.json({ message: "Nota eliminata con successo" })
  } catch (error) {
    console.error("Errore durante l'eliminazione della nota:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

// Rotte per i piani dietetici
app.get("/api/diet-plans", auth, async (req, res) => {
  try {
    const plans = await DietPlan.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(plans)
  } catch (error) {
    console.error("Errore durante il recupero dei piani dietetici:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.get("/api/diet-plans/:id", auth, async (req, res) => {
  try {
    const plan = await DietPlan.findOne({ _id: req.params.id, userId: req.userId })

    if (!plan) {
      return res.status(404).json({ error: "Piano dietetico non trovato" })
    }

    res.json(plan)
  } catch (error) {
    console.error("Errore durante il recupero del piano dietetico:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

app.post(
  "/api/diet-plans",
  auth,
  [
    body("name").notEmpty().withMessage("Il nome è obbligatorio"),
    body("userData").isObject().withMessage("I dati utente sono obbligatori"),
    body("results").isObject().withMessage("I risultati sono obbligatori"),
    body("mealPlan").isArray().withMessage("Il piano alimentare deve essere un array"),
  ],
  async (req, res) => {
    // Validazione
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { name, userData, results, mealPlan, tips } = req.body

      // Crea un nuovo piano dietetico
      const plan = new DietPlan({
        userId: req.userId,
        name,
        userData,
        results,
        mealPlan,
        tips,
      })

      await plan.save()
      res.status(201).json(plan)
    } catch (error) {
      console.error("Errore durante la creazione del piano dietetico:", error)
      res.status(500).json({ error: "Errore del server" })
    }
  },
)

app.delete("/api/diet-plans/:id", auth, async (req, res) => {
  try {
    const plan = await DietPlan.findOneAndDelete({ _id: req.params.id, userId: req.userId })

    if (!plan) {
      return res.status(404).json({ error: "Piano dietetico non trovato" })
    }

    res.json({ message: "Piano dietetico eliminato con successo" })
  } catch (error) {
    console.error("Errore durante l'eliminazione del piano dietetico:", error)
    res.status(500).json({ error: "Errore del server" })
  }
})

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`)
})

