import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CharacterEditor from "@/pages/character-editor";
import AuthPage from "@/pages/auth-page";
import { CharacterProvider } from "./context/character-context";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/character/:id" component={CharacterEditor} />
      <ProtectedRoute path="/character/new" component={CharacterEditor} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/reset-password/:token" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CharacterProvider>
          <Router />
          <Toaster />
        </CharacterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
