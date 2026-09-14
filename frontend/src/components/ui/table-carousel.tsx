import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TableCarouselProps<T> = {
  columns: string[];
  rows: T[];
  renderRow: (row: T, index: number) => ReactNode;
  emptyMessage: string;
  rowsPerPage?: number;
};

/**
 * Presents table records in small, navigable parcels.  Keeping the native
 * table inside each slide preserves column semantics and existing row actions.
 */
export function TableCarousel<T>({
  columns,
  rows,
  renderRow,
  emptyMessage,
  rowsPerPage = 5,
}: TableCarouselProps<T>) {
  const pages = useMemo(() => {
    const result: T[][] = [];
    for (let index = 0; index < rows.length; index += rowsPerPage) result.push(rows.slice(index, index + rowsPerPage));
    return result;
  }, [rows, rowsPerPage]);
  const [page, setPage] = useState(0);
  const trackPage = useCallback((api: { on: (event: "select", handler: () => void) => void; selectedScrollSnap: () => number } | undefined) => {
    api?.on("select", () => setPage(api.selectedScrollSnap()));
  }, []);

  useEffect(() => setPage(0), [rows]);

  if (pages.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <Carousel opts={{ align: "start", loop: false }} setApi={trackPage} className="mx-12">
      <CarouselContent>
        {pages.map((records, pageIndex) => (
          <CarouselItem key={pageIndex}>
            <Table>
              <TableHeader><TableRow>{columns.map((column) => <TableHead key={column}>{column}</TableHead>)}</TableRow></TableHeader>
              <TableBody>{records.map((row, index) => renderRow(row, pageIndex * rowsPerPage + index))}</TableBody>
            </Table>
          </CarouselItem>
        ))}
      </CarouselContent>
      {pages.length > 1 && <><CarouselPrevious className="-left-11" /><CarouselNext className="-right-11" /></>}
      <p className="mt-3 text-center text-xs text-muted-foreground">Parcelle {page + 1} sur {pages.length} · {rows.length} enregistrement{rows.length > 1 ? "s" : ""}</p>
    </Carousel>
  );
}
