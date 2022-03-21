import {Action, ActionPanel, Form, Icon, List, LocalStorage, useNavigation} from "@raycast/api";
import {useEffect, useState} from "react";

type ToDoType = {
  id: number
  title: string
  isCompleted: boolean
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(false)
  const [todos, setTodos] = useState<ToDoType[]>([])

  // LocalStorageから保存済みのTODOリストを取得
  useEffect(() => {
    LocalStorage.getItem<string>("todos").then((todoJson) => {
      if (!todoJson) return;

      try {
        setIsLoading(true);
        const todos: ToDoType[] = JSON.parse(todoJson);
        setTodos(todos);
      } catch (error: any) {
        throw new Error(error)
      } finally {
        setIsLoading(false)
      }
    });
  }, []);

  // LocalStorage上のTODOリストを更新
  useEffect(() => {
    LocalStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // TODO追加
  const handleAddToDo = (todo: Pick<ToDoType, 'title'>) => {
    setTodos([...todos, {id: todos.length + 1, title: todo.title, isCompleted: false}]);
  }

  // TODO削除
  const handleDeleteToDo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  // TODOのステータス変更
  const handleToggleIsCompleted = (id: number) => {
    setTodos(todos.map((todo) => {
      if (todo.id !== id) return todo

      return {id, title: todo.title, isCompleted: !todo.isCompleted}
    }))
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter by title..."
      actions={
        <ActionPanel>
          <AddTodoAction onCreate={handleAddToDo} />
        </ActionPanel>
      }
    >
      {todos.map((todo) => (
        <List.Item
          key={todo.id}
          title={todo.title}
          icon={'list-icon.png'}
          accessoryIcon={{ source: todo.isCompleted ? Icon.Checkmark : Icon.Circle }}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <ToggleTodoAction todo={todo} onToggle={() => handleToggleIsCompleted(todo.id)} />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <AddTodoAction onCreate={handleAddToDo} />
                <DeleteTodoAction onDelete={() => handleDeleteToDo(todo.id)} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

const AddTodoAction = (props: { onCreate: (todo: Omit<ToDoType, 'id'>) => void }) => {
  return (
    <Action.Push
      icon={Icon.Plus}
      title="Add Todo"
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<AddTodoForm onCreate={props.onCreate} />}
    />
  );
}

const DeleteTodoAction = (props: { onDelete: () => void }) => {
  return (
    <Action
      icon={Icon.Trash}
      title="Delete Todo"
      shortcut={{ modifiers: ["cmd"], key: "x" }}
      onAction={props.onDelete}
    />
  );
}

const ToggleTodoAction = (props: { todo: ToDoType, onToggle: () => void }) => {
  return (
    <Action
      icon={props.todo.isCompleted ? Icon.Circle : Icon.Checkmark}
      title={props.todo.isCompleted ? "Uncomplete Todo" : "Complete Todo"}
      onAction={props.onToggle}
    />
  );
}


const AddTodoForm = (props: { onCreate: (todo: Omit<ToDoType, 'id'>) => void }) => {
  const { pop } = useNavigation();

  const handleSubmit = (values: Pick<ToDoType, 'title'>) => {
    props.onCreate({ title: values.title, isCompleted: false });
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Todo" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" />
    </Form>
  );
}