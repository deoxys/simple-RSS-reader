import { useEffect, useState } from "react";
import { RefreshButton } from "./RefreshButton";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { RefreshCountdown } from "./RefreshCountdown";

interface AutoRefreshComponentProps {
  refreshCallback: () => Promise<void>;
  interval?: number;
}

export const AutoRefreshComponent = ({
  refreshCallback,
  interval = 5 * 60 * 1000,
}: AutoRefreshComponentProps) => {
  const [isAutoRefresh, setAutoRefresh] = useState(true);
  const [timeLeft, setTimeLeft] = useState(interval / 1000);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCallback();
    } catch (e) {
      console.log("something wen't wrong when autorefreshing: ", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAutoRefresh) return;
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev < 1) {
          handleRefresh();
          return interval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  });

  return (
    <div className="flex justify-between items-center">
      {isAutoRefresh ? (
        <RefreshCountdown timeLeft={timeLeft} isRefreshing={isRefreshing} />
      ) : (
        <span className="text-muted-foreground"></span>
      )}
      <div className="flex flex-row gap-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="autoRefresh">
            {isAutoRefresh ? "Disable" : "Enable"} Auto Refresh
          </Label>
          <Switch
            id="autoRefresh"
            checked={isAutoRefresh}
            onCheckedChange={setAutoRefresh}
          />
        </div>
        <RefreshButton
          refreshCallback={async () => {
            setIsRefreshing(true);
            setTimeLeft(interval / 1000);
            await refreshCallback();
            setIsRefreshing(false);
          }}
        />
      </div>
    </div>
  );
};
