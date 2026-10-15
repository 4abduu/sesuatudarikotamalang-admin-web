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
          className="text-xs font-medium text-muted-foreground hover:text-primary transition underline"
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
          className="h-10 text-sm uppercase"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !inputVal.trim()} className="h-10 gap-1.5 px-4">
          <Search className="h-4 w-4" />
          Cari
        </Button>
      </div>
      <div className="text-right">
        <button
          type="button"
          onClick={() => setShow(false)}
          className="text-[11px] text-muted-foreground hover:underline"
        >
          Tutup input manual
        </button>
      </div>
    </form>
  );
}
