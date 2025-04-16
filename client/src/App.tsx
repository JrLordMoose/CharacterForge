import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CharacterEditor from "@/pages/character-editor";
import { CharacterProvider } from "./context/character-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/character/:id" component={CharacterEditor} />
      <Route path="/character/new" component={CharacterEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CharacterProvider>
        <Router />
      </CharacterProvider>
    </QueryClientProvider>
  );
}

export default App;
