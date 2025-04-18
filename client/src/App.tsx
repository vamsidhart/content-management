import { Switch, Route } from "wouter";
import KanbanView from "./pages/KanbanView";
import CalendarView from "./pages/CalendarView";
import AllContent from "./pages/AllContent";
import NotFound from "./pages/not-found";
import AppLayout from "./components/AppLayout";
import { setupWebSocket } from "./lib/websocket";
import { queryClient } from "./lib/queryClient";

function App() {
  // Setup WebSocket connection.  This assumes setupWebSocket is correctly implemented elsewhere.
  setupWebSocket((data) => {
    // Invalidate queries when updates are received
    if (['create', 'update', 'delete'].includes(data.type)) {
      queryClient.invalidateQueries({ queryKey: ['/api/contents'] });
    }
  });

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={KanbanView} />
        <Route path="/calendar" component={CalendarView} />
        <Route path="/all" component={AllContent} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

export default App;

// Placeholder for the missing websocket and queryClient implementations.  These need to be added separately.
// This is a minimal example and error handling and robustness are missing.
export const setupWebSocket = (callback) => {
  const ws = new WebSocket('ws://localhost:8080'); // Replace with your WebSocket server address

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    // Implement reconnection logic if needed
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};


// Placeholder for queryClient.  Replace with a real implementation using a library like react-query.
export const queryClient = {
  invalidateQueries: (query) => {
    console.log('Invalidating queries:', query);
    // Implementation to invalidate queries based on the queryKey
  }
};