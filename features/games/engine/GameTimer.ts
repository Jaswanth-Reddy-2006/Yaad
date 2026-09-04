export class GameTimer {
  private elapsedSeconds: number = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private onTickCallback?: (seconds: number) => void;

  constructor(onTick?: (seconds: number) => void) {
    this.onTickCallback = onTick;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.elapsedSeconds++;
      if (this.onTickCallback) {
        this.onTickCallback(this.elapsedSeconds);
      }
    }, 1000);
  }

  public pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public resume(): void {
    this.start();
  }

  public reset(): void {
    this.pause();
    this.elapsedSeconds = 0;
    if (this.onTickCallback) {
      this.onTickCallback(0);
    }
  }

  public dispose(): void {
    this.pause();
    this.onTickCallback = undefined;
  }

  public getSeconds(): number {
    return this.elapsedSeconds;
  }
}
