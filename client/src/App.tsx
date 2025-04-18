import { Switch, Route } from "wouter";
import KanbanView from "./pages/KanbanView";
import CalendarView from "./pages/CalendarView";
import AllContent from "./pages/AllContent";
import Register from "./pages/Register";
import NotFound from "./pages/not-found";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <Switch>
      <Route path="/register" component={Register} />
      <Route>
        <AppLayout>
          <Switch>
            <Route path="/" component={KanbanView} />
            <Route path="/calendar" component={CalendarView} />
            <Route path="/all" component={AllContent} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

export default App;
