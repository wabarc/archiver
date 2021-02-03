declare type telegram = {
  channel: string;
  msgid: number;
};

export interface Types {
  telegram: telegram;
}

export declare type Archived = {
  id: number;
  url: string;
  title: string;
  content: string;
  success: boolean;
};

export declare type Task = {
  id: number;
  url: string;
  path: string;
  success: boolean;
};

export declare type Context = {
  dir: string;
  from: number;
  to: number;
};

export declare type Config = {
  channel: string;
  context: Context;
};

export declare type Stage = {
  id: number;
  stage: {
    orig?: string[];
    ia?: string[];
    is?: string[];
    ip?: string[];
    ph?: string[];
  };
};
