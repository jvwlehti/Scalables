import * as todoService from "./services/todoServices.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

const SERVER_ID = crypto.randomUUID();

const cacheTodoService = cacheMethodCalls(todoService, ["addTodo", "deleteTodo"])

const handleGetRoot = async () => {
    return new Response(`Hello from ${ SERVER_ID }`);
};

const getTodo = async (request, urlPatternResult) => {

    const id = urlPatternResult.pathname.groups.id;
    const todos = Response.json(await cacheTodoService.getTodo(id))
    if (todos.length === 0) {
        return new Response("Not found", { status: 404 });
    }
    return Response.json(todos[0]);
};

const getTodos = async () => {
    return Response.json(cacheTodoService.getTodos());
};

const addTodo = async (request) => {
    let todo;

    try {
        todo = await request.json();
    } catch (e) {
        return new Response("Bad request", { status: 400 });
    }

    if (!todo || todo.length === 0) {
        return new Response("Bad request", { status: 400 });
    }
    await cacheTodoService.addTodo(todo.item);
    console.log(todo)
    return new Response("OK", { status: 200 });
};

const deleteToDo = async (request, urlPatternResult) => {
    const id = urlPatternResult.pathname.groups.id;
    const todos = await cacheTodoService.getTodo(id)
    if (todos.length === 0) {
        return new Response("Not found", { status: 404 });
    }
    await cacheTodoService.deleteTodo(id)

    return new Response("OK", { status: 200 });
};
const urlMapping = [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/" }),
        fn: handleGetRoot,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/todos/:id" }),
        fn: getTodo,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/todos" }),
        fn: getTodos,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/todos" }),
        fn: addTodo,
    },
    {
        method: "DELETE",
        pattern: new URLPattern({ pathname: "/todos/:id" }),
        fn: deleteToDo,
    }
];

const handleRequest = async (request) => {
    const mapping = urlMapping.find(
        (um) => um.method === request.method && um.pattern.test(request.url)
    );

    if (!mapping) {
        return new Response("Not found", { status: 404 });
    }

    const mappingResult = mapping.pattern.exec(request.url);
    try {
        return await mapping.fn(request, mappingResult);
    } catch (e) {
        console.log(e);
        return new Response(e.stack, { status: 500 })
    }
};

const portConfig = { port: 7777, hostname: '0.0.0.0' };
Deno.serve(portConfig, handleRequest);