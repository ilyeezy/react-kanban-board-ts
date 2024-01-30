import Column from "../components/Column";
export interface IColumn {
  id: string | number;
  title: string;
}

export interface ITask {
  id: string | number;
  columndId: string | number;
  content: string;
}
