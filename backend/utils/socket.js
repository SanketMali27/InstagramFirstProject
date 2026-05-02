let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const getSocketIO = () => ioInstance;

export const emitToUserRoom = (userId, event, payload) => {
  if (!ioInstance || !userId) {
    return;
  }

  ioInstance.to(String(userId)).emit(event, payload);
};
