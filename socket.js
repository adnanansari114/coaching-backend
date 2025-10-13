const { Server } =  require("socket.io");

let io;

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'https://coaching-frontend-ktd0.onrender.com' || "*", // React frontend ka URL daalna chaho to daal sakte ho
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // Student ya teacher quiz room join karega
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
        console.log(`✅ User ${socket.id} joined room: ${roomId}`);
      });


    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) throw new Error("❌ Socket.io not initialized");
  return io;
};
