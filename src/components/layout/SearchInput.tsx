import { Search } from "lucide-react";
import { controlClass } from "@/components/ui/Input";
import { search as searchCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  id?: string;
  defaultValue?: string;
  className?: string;
};

export function SearchInput({ id = "global-search", defaultValue, className }: SearchInputProps) {
  return (
    <form method="get" action="/search" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {searchCopy.label}
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={80}
        placeholder={searchCopy.placeholder}
        className={cn(controlClass, "h-9 pl-9")}
      />
      <Search
        size={16}
        strokeWidth={1.75}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
      />
    </form>
  );
}
