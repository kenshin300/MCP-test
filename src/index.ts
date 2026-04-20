import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { string, z } from "zod";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const TASKS_FILE = "/Users/kenshin/files/my-mcp/tasks.json";

interface Task {
    id: number,
    title: string,
    completed: boolean,
    createdAt: Date,
    priority: "low" | "medium" | "high",
    dueDate?: Date | undefined
}

const tasks: Task[] = existsSync(TASKS_FILE)
? JSON.parse(readFileSync(TASKS_FILE, "utf-8"))
: [];

const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});



server.tool(
    "add_task",
    "Добавляет новую задачу",
    {title : z.string(), priority: z.enum(["low", "medium","high"]), dueDate: z.string().optional()},
    async ({title, priority, dueDate})=>{
        const task: Task = {
            id: tasks.length + 1,
            title: title,
            completed: false,
            createdAt: new Date(),
            priority: priority,
            dueDate: dueDate ? new Date(dueDate) : undefined
        }
        tasks.push(task);
        writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2))
        return{content:[{type: "text", text: `Новая задача добавлена: ${task.title} (id: ${task.id}) `}]}
}
);

server.tool(
    "list_tasks",
    "Возвращает все задачи",
    { filter: z.enum(["all", "completed", "pending"]).optional() },
    async ({filter}) => {
        let filtered = tasks

        if (filter === "completed"){
            filtered = tasks.filter(t=> t.completed == true)
        }
        else if (filter === "pending"){
            filtered = tasks.filter(t=> t.completed == false)
        }
        return{
            content:[{type: "text", text: `Список всех задач: ${JSON.stringify(filtered, null, 2)}`}]
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
        writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2))
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

        writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2))

        return{
            content:[{type: "text",text: `Задача с id: ${id} удалена!`}]
        }
        }
)

const transport = new StdioServerTransport();
await server.connect(transport);