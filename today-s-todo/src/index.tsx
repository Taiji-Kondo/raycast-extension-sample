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

  const handleAddToDo = (todo: Pick<ToDoType, 'title'>) => {
    setTodos([...todos, {id: todos.length + 1, title: todo.title, isCompleted: false}]);
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
      {todos.map(({id, title, isCompleted}) => (
        <List.Item
          key={id}
          icon={'list-icon.png'}
          title={title}
          accessoryTitle={title}
          accessoryIcon={{ source: Icon.Circle }}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <AddTodoAction onCreate={handleAddToDo} />
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
      icon={Icon.Pencil}
      title="Add Todo"
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<AddTodoForm onCreate={props.onCreate} />}
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