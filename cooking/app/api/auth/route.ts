import { NextResponse } from "next/server";

// Simulazione di un database in memoria (i dati si resettano se riavvii il server).
let users = [
  {
    id: 1,
    name: "Mario Rossi",
    email: "mario.rossi@esempio.com",
    password: "password123", // Nella realtà andrebbe hashata (es. con bcrypt).
  },
];

export async function POST(request: Request) {
  try {
    // Leggiamo i campi inviati dal client
    const { action, name, email, password } = await request.json();

    // 1. Controllo che ci sia un'azione (login o register)
    if (!action) {
      return NextResponse.json({ error: "Manca l'azione (login o register)" }, { status: 400 });
    }

    // 2. Login
    if (action === "login") {
      // Controlliamo che email e password siano presenti
      if (!email || !password) {
        return NextResponse.json({ error: "Email e password sono obbligatorie" }, { status: 400 });
      }

      // Cerchiamo l'utente
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) {
        return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
      }

      // In un caso reale, qui genereremmo e restituiremmo un token JWT
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // 3. Register
    else if (action === "register") {
      // Verifichiamo che i campi obbligatori siano presenti
      if (!name || !email || !password) {
        return NextResponse.json({ error: "Nome, email e password sono obbligatori" }, { status: 400 });
      }

      // Controlliamo se l'utente esiste già
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        return NextResponse.json({ error: "Email già registrata" }, { status: 400 });
      }

      // Creiamo il nuovo utente
      const newUser = {
        id: users.length + 1,
        name,
        email,
        password, // In produzione andrebbe hashata
      };
      users.push(newUser);

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    }

    // Se action non è né "login" né "register", rispondiamo con errore
    return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
  } catch (error) {
    console.error("Errore durante l'autenticazione:", error);
    return NextResponse.json({ error: "Errore del server" }, { status: 500 });
  }
}


