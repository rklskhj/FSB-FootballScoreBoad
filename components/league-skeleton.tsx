import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function LeagueSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex space-x-2 mb-4">
          <Skeleton className="h-6 w-[170px]" />
          <Skeleton className="h-6 w-[16px]" />
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-8" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-6" />
                </TableHead>
                <TableHead className="w-16 text-center">
                  <Skeleton className="h-4 w-10 mx-auto" />
                </TableHead>
                <TableHead className="w-16 text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableHead>
                <TableHead className="w-16 text-center">
                  <Skeleton className="h-4 w-6 mx-auto" />
                </TableHead>
                <TableHead className="w-16 text-center">
                  <Skeleton className="h-4 w-6 mx-auto" />
                </TableHead>
                <TableHead className="w-16 text-center">
                  <Skeleton className="h-4 w-6 mx-auto" />
                </TableHead>
                <TableHead className="w-16 text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableHead>
                <TableHead className="w-16 text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableHead>
                <TableHead className="w-16 text-center">
                  <Skeleton className="h-4 w-10 mx-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(20)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-6 w-6" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-6 w-6 mr-2" />
                        <Skeleton className="h-6 w-[120px]" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
