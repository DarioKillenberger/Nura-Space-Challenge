import WebSocket from "ws";
import usersStore from "../store/users";

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket server is running on ws://localhost:8080");

// Extend WebSocket so we can attach identity (optional, for TypeScript)
interface IdentifiedWebSocket extends WebSocket {
  userId?: string;
  name?: string;
  email?: string;
}

// Connection event handler
wss.on("connection", (ws: IdentifiedWebSocket) => {
  console.log("New client connected");

  ws.send(JSON.stringify({ type: "welcome", message: "Webserver Connected!" }));

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === "identify") {
        ws.userId = data.userId;
        ws.name = data.name;
        ws.email = data.email;
        console.log("Client identified:", { userId: ws.userId, name: ws.name });
        ws.send(
          JSON.stringify({
            type: "identified",
            message: `Welcome, ${ws.name ?? ws.userId ?? "client"}`,
          }),
        );
        return;
      }
    } catch {
      // Not JSON or other format – treat as plain text if needed
    }
    console.log("Received:", raw.toString());
    ws.send(
      JSON.stringify({
        type: "echo",
        message: `Server received: ${raw.toString()}`,
      }),
    );
  });

  ws.on("close", () => {
    console.log(
      "Client disconnected",
      ws.userId ? `(userId: ${ws.userId})` : "",
    );
  });
});

/**
 * Simple broadcast helper used by controllers
 * Sends a JSON-serialised payload to all connected clients.
 */
function broadcast(payload: unknown) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

/**
 * Send a payload only to clients whose saved cityName matches
 * the given cityName (case-insensitive).
 */
function sendToCity(cityName: string, payload: unknown) {
  const target = cityName.toLowerCase();
  const data = JSON.stringify(payload);

  wss.clients.forEach((client) => {
    const ws = client as IdentifiedWebSocket;
    if (client.readyState !== WebSocket.OPEN || !ws.userId) {
      return;
    }

    const userCity = usersStore.getUserCity(ws.userId);
    if (!userCity) return;

    if (userCity.cityName.toLowerCase() === target) {
      client.send(data);
    }
  });
}

const websocketService = { send: broadcast, sendToCity };

export default websocketService;
