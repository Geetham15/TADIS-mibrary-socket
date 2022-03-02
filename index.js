const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  // when connect
  console.log("a user connected");
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        receiverId,
        text,
      });
    }
  });

  socket.on("updatePendingStatus", (data) => {
    const user = getUser(data.bookOwnerId);
    if (user) {
      console.log("updating pending status");
      io.to(user.socketId).emit("updatePendingStatus", data);
    }
  });

  socket.on("initiateChat", (data) => {
    const user = getUser(data.bookowner_id);
    if (user) {
      console.log("initiating chat");
      io.to(user.socketId).emit("initiateChat", data);
    }
  });

  socket.on("confirmRental", ({ bookBorrowingId, userId }) => {
    const user = getUser(userId);
    if (user) {
      console.log("confirming rental");
      io.to(user.socketId).emit("confirmRental", {
        bookBorrowingId,
      });
    }
  });

  socket.on("changeRentalStatus", ({ bookBorrowingId, userId, bookStatus }) => {
    const user = getUser(userId);
    if (user) {
      console.log("changing rental status");
      io.to(user.socketId).emit("changeRentalStatus", {
        bookBorrowingId,
        bookStatus,
      });
    }
  });

  socket.on("confirmReturn", ({ bookBorrowingId, userId }) => {
    const user = getUser(userId);
    if (user) {
      console.log("confirming return");
      io.to(user.socketId).emit("confirmReturn", {
        bookBorrowingId,
      });
    }
  });

  // when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
