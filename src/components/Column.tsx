import React, { useState } from "react";
import { IColumn, ITask } from "../types/types";
import TrashIcon from "../icons/TrashIcon";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";
interface Props {
  column: IColumn;
  deleteColumn: (id: string | number) => void;
  updateColumn: (id: string | number, title: string) => void;
  createTask: (id: string | number) => void;
  tasks: ITask[];
  deleteTask: (id: string | number) => void;
  updateTask: (id: string | number, content: string) => void;
}
export default function Column(props: Props) {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    updateTask,
    tasks,
    deleteTask,
  } = props;
  const [editMode, setEditMode] = useState(false);
  const tasksId = React.useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnedBackgroundColor opacity-40 border-2 border-rose-500 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnedBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className="bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-b-none p-3 font-bold border-columnedBackgroundColor border-4 flex items-center justify-between"
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-columnedBackgroundColor px-2 py-1 text-sm">
            0
          </div>
          {!editMode && column.title}
          {editMode && (
            <input
              className="bg-black focus:border-rose-500 border rounded outline-none px-2"
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              value={column.title}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="stroke-gray-500 hover:stroke-white hover:bg-columnedBackgroundColor rounded px-1 py-2"
        >
          <TrashIcon />
        </button>
      </div>

      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksId}>
          {tasks.map((task) => (
            <TaskCard
              updateTask={updateTask}
              deleteTask={deleteTask}
              key={task.id}
              task={task}
            />
          ))}
        </SortableContext>
      </div>
      <button
        onClick={() => createTask(column.id)}
        className="flex gap-2 items-center border-columnedBackgroundColor border-2 rounded-md p-4 border-x-columnedBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black "
      >
        <PlusIcon />
        Add task
      </button>
    </div>
  );
}
