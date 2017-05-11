export type ErrorHandler = (err: Error) => void;

export interface Processes {
    [key: string]: number;
}

export interface PullResult {
    ticks: number;
    updated: number;
    processes: Processes;
}
