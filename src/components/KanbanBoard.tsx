import React from "react";
import PlusIcon from "../icons/PlusIcon";
import { IColumn, ITask } from "../types/types";
import Column from "./Column";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

function KanbanBoard() {
  const [columns, setColumns] = React.useState<IColumn[]>([]);
  const [activeColumn, setActiveColumn] = React.useState<IColumn | null>(null);
  const [activeTask, setActiveTask] = React.useState<ITask | null>(null);
  const [tasks, setTasks] = React.useState<ITask[]>([]);

  const columnsId = React.useMemo(() => {
    return columns.map((col) => col.id);
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );

  function createColumn() {
    const columnToAdd: IColumn = {
      id: Date.now(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  }

  function updateColumn(id: number | string, title: string) {
    const newColumns = columns.map((column) => {
      if (column.id === id) {
        return {
          ...column,
          title,
        };
      } else {
        return column;
      }
    });
    setColumns(newColumns);
  }

  function createTask(columndId: string | number) {
    const taskToAdd: ITask = {
      id: Date.now(),
      columndId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, taskToAdd]);
  }

  function deleteTask(id: string | number) {
    const updateTasks = tasks.filter((task) => task.id !== id);
    setTasks(updateTasks);
  }

  function deleteColumn(id: string | number) {
    const filterColumns = columns.filter((column) => column.id !== id);
    setColumns(filterColumns);

    const newTasks = tasks.filter((task) => task.columndId !== id);
    setTasks(newTasks);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columndId != tasks[overIndex].columndId) {
          tasks[activeIndex].columndId = tasks[overIndex].columndId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columndId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  function updateTask(id: string | number, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          content,
        };
      } else {
        return task;
      }
    });
    setTasks(newTasks);
  }

  return (
    <div className='m-auto flex min-h-screen w-full items-center  overflow-x-auto overflow-y-hidden px-[40px]'>
      <DndContext
        sensors={sensors}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
      >
        <div className='m-auto flex gap-4'>
          <button
            onClick={createColumn}
            className='flex gap-5 outline-none h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnedBackgroundColor p-4 ring-rose-500 hover:ring-2'
          >
            <PlusIcon />
            Add Column
          </button>
          <div className='flex gap-4'>
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <Column
                  createTask={createTask}
                  updateColumn={updateColumn}
                  key={column.id}
                  deleteColumn={deleteColumn}
                  column={column}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  tasks={tasks.filter((task) => task.columndId === column.id)}
                />
              ))}
            </SortableContext>
          </div>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <Column
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                deleteTask={deleteTask}
                createTask={createTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.columndId === activeColumn.id,
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                deleteTask={deleteTask}
                updateTask={updateTask}
                task={activeTask}
              />
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
