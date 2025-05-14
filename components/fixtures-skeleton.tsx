import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function FixturesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex space-x-2 mb-4">
        <Skeleton className="h-6 w-[170px]" />
        <Skeleton className="h-6 w-[16px]" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 gap-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-6 w-20" />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 mr-3 rounded-full" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-8 w-8 ml-3 rounded-full" />
                      </div>
                    </div>

                    <Skeleton className="h-4 w-32 mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
