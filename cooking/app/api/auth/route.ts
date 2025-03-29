import { NextResponse } from "next/server"

// Simulazione di un database di utenti
const users = [
  {
    id: 1,
    name: "Mario Rossi",
    email: "mario.rossi@esempio.com",
    password: "password123", // In un'app reale, questa sarebbe hashata
  },
]

export async function POST(request: Request) {
  try {
    const { action, email, password, name } = await request.json()

    if (action === "login") {
      // Verifica delle credenziali
      const user = users.find((u) => u.email === email && u.password === password)

      if (!user) {
        return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 })
      }

      // In un'app reale, qui genereremmo un token JWT
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
    } else if (action === "register") {
      // Verifica se l'utente esiste già
      const existingUser = users.find((u) => u.email === email)

      if (existingUser) {
        return NextResponse.json({ error: "Email già registrata" }, { status: 400 })
      }

      // Crea un nuovo utente
      const newUser = {
        id: users.length + 1,
        name,
        email,
        password, // In un'app reale, questa sarebbe hashata
      }

      users.push(newUser)

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      })
    }

    return NextResponse.json({ error: "Azione non valida" }, { status: 400 })
  } catch (error) {
    console.error("Errore durante l'autenticazione:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

