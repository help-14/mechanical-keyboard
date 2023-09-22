import { createResource } from "solid-js";

const fetcher = query => fetch(query).then(r => r.json());

export default () => {
  const [user] = createResource(`https://jsonplaceholder.typicode.com/users/2/`, fetcher),
    [info] = createResource(() => user() && `https://jsonplaceholder.typicode.com/users/2/todos`, fetcher);

  return { user, info };
};
