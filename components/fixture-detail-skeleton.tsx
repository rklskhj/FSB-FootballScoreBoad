import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FixtureDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-48 mt-2" />
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col items-center mb-4">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>

          <div className="grid grid-cols-7 items-center gap-4 py-4">
            <div className="col-span-3 flex flex-col items-center md:items-end">
              <Skeleton className="h-16 w-16 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>

            <div className="col-span-1 flex justify-center">
              <Skeleton className="h-10 w-20" />
            </div>

            <div className="col-span-3 flex flex-col items-center md:items-start">
              <Skeleton className="h-16 w-16 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
            <Skeleton className="h-5 w-48" />
            <div className="hidden sm:block">•</div>
            <Skeleton className="h-5 w-32" />
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2 mb-4">
        <Skeleton className="h-6 w-[170px]" />
        <Skeleton className="h-6 w-[16px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-full ml-4" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-full ml-4" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
