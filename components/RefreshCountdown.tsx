interface RefreshCountdownProps {
  timeLeft: number;
  isRefreshing: boolean;
}

const parseTimeLeft = (timeLeft: number) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const RefreshCountdown = ({
  timeLeft,
  isRefreshing,
}: RefreshCountdownProps) => {
  return (
    <span className="text-muted-foreground">
      {isRefreshing
        ? "Refreshing..."
        : `Refreshing in ${parseTimeLeft(timeLeft)}`}
    </span>
  );
};
