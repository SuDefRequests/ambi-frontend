export type ArchivePassage = {
  passage_id: string;
  archive_type: 'baws' | 'cad';
  source: string;
  page: number | null;
  volume: number;
  title: string | null;
  url: string | null;
  text: string;
};
