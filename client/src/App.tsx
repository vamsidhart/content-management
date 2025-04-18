
import { Switch, Route, Redirect, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import KanbanView from "./pages/KanbanView";
import CalendarView from "./pages/CalendarView";
import AllContent from "./pages/AllContent";
import NotFound from "./pages/not-found";
import Login from "./pages/Login";
import AppLayout from "./components/AppLayout";
import { useWebSocket } from '@/hooks/use-websocket';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useQuery(["/api/user"]);

  if (isLoading) return null;

  if (!user) {
    setLocation("/login");
    return null;
  }

  return <>{children}</>;
}

function App() {
  useWebSocket();
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <KanbanView />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/calendar">
        <ProtectedRoute>
          <AppLayout>
            <CalendarView />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/all">
        <ProtectedRoute>
          <AppLayout>
            <AllContent />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
