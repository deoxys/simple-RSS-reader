import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface RefreshButtonProps {
  refreshCallback: () => Promise<void>;
}

export const RefreshButton = ({ refreshCallback }: RefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
  };

  useEffect(() => {
    const refreshAction = async () => {
      if (isRefreshing) {
        try {
          await refreshCallback();
        } catch (error) {
          toast.error("Error while refreshing");
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    refreshAction();
  }, [isRefreshing]);

  return (
    <Button disabled={isRefreshing} onClick={handleRefresh}>
      {isRefreshing ? (
        <>
          <span className="loading loading-infinity loading-sm"></span>
          Refreshing
        </>
      ) : (
        <>Refresh</>
      )}
    </Button>
  );
};
