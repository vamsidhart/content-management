
import { Switch, Route, Redirect, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import KanbanView from "./pages/KanbanView";
import CalendarView from "./pages/CalendarView";
import AllContent from "./pages/AllContent";
import Register from "./pages/Register";
import NotFound from "./pages/not-found";
import AppLayout from "./components/AppLayout";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useQuery({ 
    queryKey: ["/api/user"],
    retry: false
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    setLocation("/register");
    return null;
  }

  return <>{children}</>;
}

function App() {
  const [location] = useLocation();
  
  // Redirect root to /register if not authenticated
  if (location === "/") {
    return <Redirect to="/register" />;
  }

  return (
    <Switch>
      <Route path="/register" component={Register} />
      <Route>
        <PrivateRoute>
          <AppLayout>
            <Switch>
              <Route path="/kanban" component={KanbanView} />
              <Route path="/calendar" component={CalendarView} />
              <Route path="/all" component={AllContent} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </PrivateRoute>
      </Route>
    </Switch>
  );
}

export default App;
