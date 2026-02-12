const WS_URL = "ws://localhost:8080";

export type IdentifyPayload = {
  userId: string;
  name?: string;
  email?: string;
};

type MessageHandler = (event: MessageEvent) => void;

let socket: WebSocket | null = null;
const messageHandlers = new Set<MessageHandler>();
let pendingIdentify: IdentifyPayload | null = null;

function sendIdentify() {
  if (!socket || socket.readyState !== WebSocket.OPEN || !pendingIdentify)
    return;
  socket.send(JSON.stringify({ type: "identify", ...pendingIdentify }));
  pendingIdentify = null;
}

function initSocket(identify?: IdentifyPayload) {
  if (identify) pendingIdentify = identify;

  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    if (socket.readyState === WebSocket.OPEN) sendIdentify();
    return socket;
  }

  socket = new WebSocket(WS_URL);

  socket.addEventListener("open", () => {
    console.log("WebSocket connection established");
    sendIdentify();
  });

  socket.addEventListener("message", (event) => {
    console.log("WebSocket message received:", event.data);
    messageHandlers.forEach((handler) => handler(event));
  });

  socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event.code, event.reason);
    socket = null;
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
  });

  return socket;
}

export const websocketService = {
  /** Ensure a WebSocket connection exists (idempotent). Pass identify to tell the server who is connecting. */
  connect(identify?: IdentifyPayload) {
    return initSocket(identify);
  },

  /** Register a message handler; returns an unsubscribe function. */
  onMessage(handler: MessageHandler) {
    messageHandlers.add(handler);
    // Ensure we are connected when someone subscribes
    initSocket();

    return () => {
      messageHandlers.delete(handler);
    };
  },

  /** Send a message if the socket is open. */
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    } else {
      console.warn("WebSocket is not open; cannot send message");
    }
  },

  /** Close the connection manually. */
  close() {
    if (socket) {
      socket.close();
      socket = null;
    }
  },
};
