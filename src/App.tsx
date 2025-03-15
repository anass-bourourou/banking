
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Accounts from "./pages/Accounts";
import Transfers from "./pages/Transfers";
import Beneficiaries from "./pages/Beneficiaries";
import Payments from "./pages/Payments";
import Statements from "./pages/Statements";
import Receipts from "./pages/Receipts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/statements" element={<Statements />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
