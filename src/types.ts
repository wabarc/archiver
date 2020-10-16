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
