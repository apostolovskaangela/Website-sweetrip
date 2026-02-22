let socket: WebSocket | null = null;

export const socketService = {
  connect(token: string) {
    if (socket) return socket;

    socket = new WebSocket(
      `ws://local://api/${token}`
    );

    socket.onopen = () => {
      console.log('🟢 WebSocket connected');
    };

    socket.onerror = (e) => {
      console.error('🔴 WebSocket error', e);
    };

    socket.onclose = () => {
      console.log('🟡 WebSocket closed');
      socket = null;
    };

    return socket;
  },

  send(data: any) {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  },

  disconnect() {
    socket?.close();
    socket = null;
  }
};
