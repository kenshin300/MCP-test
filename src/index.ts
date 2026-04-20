import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, writeFileSync, existsSync } from "fs";

interface Task {
    id: number,
    title: string,
    completed: boolean,
    createdAt: Date
}

const tasks: Task[] = existsSync("tasks.json")
? JSON.parse(readFileSync("tasks.json", "utf-8"))
: [];

const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});



server.tool(
    "add_task",
    "Добавляет новую задачу",
    {title : z.string()},
    async ({title})=>{
        const task: Task = {
            id: tasks.length + 1,
            title: title,
            completed: false,
            createdAt: new Date()
        }
        tasks.push(task);
        writeFileSync("tasks.json", JSON.stringify(tasks, null, 2))
        return{content:[{type: "text", text: `Новая задача добавлена: ${task.title} (id: ${task.id}) `}]}
}
);

server.tool(
    "list_tasks",
    "Возвращает все задачи",
    {},
    async () => {
        return{
            content:[{type: "text", text: `Список всех задач: ${JSON.stringify(tasks, null, 2)}`}]
        }
    }
);

server.tool(
    "complete_task",
    "Помечает задачу как выполненную",
    {id: z.number()},
    async({id})=>{
        const task = tasks.find(t=> t.id == id)
        if (!task){
            return{
                content:[{type: "text", text: `Задача с id ${id} не найдена`}]
            }
        }
        task.completed = true;
        writeFileSync("tasks.json", JSON.stringify(tasks, null, 2))
        return{
            content:[{type: "text",text: `Задача с id: ${id} выполнена!`}]
        }
    }
);

server.tool(
    "delete_task",
    "Удаляет задачу",
    {id: z.number()},
    async ({id}) => {
        const task = tasks.findIndex(t=> t.id == id)
        if (task == -1){
            return{
                content:[{type: "text", text: `Задача с id ${id} не найдена`}]
            }
        }
        tasks.splice(task,1);

        writeFileSync("tasks.json", JSON.stringify(tasks, null, 2))

        return{
            content:[{type: "text",text: `Задача с id: ${id} удалена!`}]
        }
        }
)

const transport = new StdioServerTransport();
await server.connect(transport);