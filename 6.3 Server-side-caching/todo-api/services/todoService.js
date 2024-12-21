import {postgres} from '../deps.js'

const sql = postgres({})

const getTodo = async (id) => {
    return await sql`SELECT * FROM todos WHERE id = ${id}`;
}

const getTodos = async () => {
    return await sql`SELECT * FROM todos`;
};

const addTodo = async (name) => {
    await sql`INSERT INTO todos (item) VALUES (${name})`;
};

const deleteTodo = async (id) => {
    sql`DELETE FROM todos WHERE id = ${ id }`;
}

export {getTodos, getTodo, addTodo, deleteTodo}