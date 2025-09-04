export const createWebSocket = (setPlankStatus, setAngle, setTimeHeld) => {
    const socket = new WebSocket("ws://localhost:8000/ws");

    socket.onmessage = (event) => {
        const feedback = JSON.parse(event.data);
        setPlankStatus(feedback.plank);
        setAngle(feedback.angle);
        setTimeHeld(feedback.time_held);
    };

    socket.onclose = () => console.log("WebSocket Disconnected");
    socket.onerror = (error) => console.error("WebSocket Error:", error);

    return socket;
};