import { Switch, Route } from "wouter";
import KanbanView from "./pages/KanbanView";
import CalendarView from "./pages/CalendarView";
import AllContent from "./pages/AllContent";
import Register from "./pages/Register";
import NotFound from "./pages/not-found";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={KanbanView} />
        <Route path="/calendar" component={CalendarView} />
        <Route path="/all" component={AllContent} />
        <Route path="/register" component={Register} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

export default App;
