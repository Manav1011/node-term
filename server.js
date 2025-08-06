const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const pty = require("node-pty");
const path = require("path");

const app = express();
const server = http.createServer(app);

// ✅ Attach WebSocket server to path /ws
const wss = new WebSocket.Server({ server, path: "/ws" });

app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", function connection(ws) {
  const shell = process.platform === "win32" ? "powershell.exe" : "bash";
  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });

  ptyProcess.onData(data => {
    ws.send(data);
  });

  ws.on("message", msg => {
    ptyProcess.write(msg);
  });

  ws.on("close", () => {
    ptyProcess.kill();
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Terminal running at http://localhost:${PORT}`);
  console.log(`💬 WebSocket listening on ws://localhost:${PORT}/ws`);
});
