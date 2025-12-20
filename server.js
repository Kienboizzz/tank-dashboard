const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const mqtt = require("mqtt");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// ================= MQTT =================
const mqttClient = mqtt.connect(
    "mqtts://bcf6c644707e4f51a13a84773949161e.s1.eu.hivemq.cloud:8883", {
        username: "esp8266",
        password: "Cuong0772205498."
    }
);

mqttClient.on("connect", () => {
    console.log("MQTT connected");
    mqttClient.subscribe("tank/#");
});

mqttClient.on("message", (topic, payload) => {
    io.emit("mqtt", {
        topic,
        msg: payload.toString()
    });
});

// ================= WEB =================
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// nhận lệnh từ web → publish MQTT
io.on("connection", (socket) => {
    console.log("Web client connected");

    socket.on("cmd", ({ topic, value }) => {
        mqttClient.publish(topic, value, { retain: true });
    });

    socket.on("disconnect", () => {
        console.log("Web client disconnected");
    });
});

server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});