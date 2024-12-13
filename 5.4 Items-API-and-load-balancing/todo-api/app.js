import { postgres } from './deps.js'

const sql = postgres({});
const SERVER_ID = crypto.randomUUID();

const handleGetRoot = async () => {
    return new Response(`Hello from ${ SERVER_ID }`);
};

const getTodo = async (request, urlPatternResult) => {

    const id = urlPatternResult.pathname.groups.id;
    const todos = await sql`SELECT * FROM todos WHERE id = ${ id }`;
    if (todos.length === 0) {
        return new Response("Not found", { status: 404 });
    }
    return Response.json(todos[0]);
};

const getTodos = async () => {
    const todos = await sql`SELECT * FROM todos`;
    return Response.json(todos);

};

const addTodo = async (request) => {
    let item;

    try {
        const jsonData = await request.json();
        item = jsonData.item.trim();
    } catch (e) {
        return new Response("Bad request", { status: 400 });
    }

    if (!item || item.length === 0) {
        return new Response("Bad request", { status: 400 });
    }

    await sql`INSERT INTO todos (item) VALUES (${ item })`;
    return new Response("OK", { status: 200 });

};

const deleteToDo = async (request, urlPatternResult) => {
    const id = urlPatternResult.pathname.groups.id;
    const todos = await sql`SELECT * FROM todos WHERE id = ${ id }`;
    if (todos.length === 0) {
        return new Response("Not found", { status: 404 });
    }
    await sql`DELETE FROM todos WHERE id = ${ id }`;

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