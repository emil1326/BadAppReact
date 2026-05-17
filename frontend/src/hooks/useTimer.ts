import { useAppSelector } from '../store/hooks';

export function useTimer() {
  const endTime = useAppSelector((state) => state.flow.endTime);
  return {
    endTime,
    isActive: endTime !== null,
  };
}
