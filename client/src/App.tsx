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

