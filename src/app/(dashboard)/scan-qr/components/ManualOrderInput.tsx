import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ManualOrderInputProps {
  onSearch: (orderNumber: string) => void;
  loading: boolean;
}

export function ManualOrderInput({ onSearch, loading }: ManualOrderInputProps) {
  const [show, setShow] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim().toUpperCase());
    }
  };

  if (!show) {
    return (
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setShow(true)}
          className="px-2 py-2 text-xs font-medium text-muted-foreground transition underline hover:text-primary"
        >
          Atau input nomor pesanan manual (SDK-XXXX)
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Masukkan No. Pesanan (mis. SDK-1234)"
          className="h-11 text-base uppercase"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="search"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !inputVal.trim()} className="h-11 gap-1.5 px-4">
          <Search className="h-4 w-4" />
          Cari
        </Button>
      </div>
      <div className="text-right">
        <button
          type="button"
          onClick={() => setShow(false)}
          className="px-2 py-2 text-xs text-muted-foreground hover:underline"
        >
          Tutup input manual
        </button>
      </div>
    </form>
  );
}
