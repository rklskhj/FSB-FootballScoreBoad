"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // 초기 네트워크 상태 설정
    setIsOnline(navigator.onLine);

    // 네트워크 상태 변경 이벤트 리스너 추가
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "네트워크 연결됨",
        description: "인터넷 연결이 복원되었습니다.",
        variant: "default",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "네트워크 끊김",
        description: "인터넷 연결이 끊겼습니다. 제한된 기능만 사용 가능합니다.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  if (isOnline) {
    return null; // 온라인 상태일 때는 아무것도 표시하지 않음
  }

  // 오프라인 상태일 때만 표시
  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-full flex items-center shadow-lg z-50">
      <WifiOff size={16} className="mr-2" />
      <span className="text-sm font-medium">오프라인 모드</span>
    </div>
  );
}
