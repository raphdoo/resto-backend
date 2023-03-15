module.exports = (midddleware) => (socket, next) =>
  midddleware(socket.request, {}, next);