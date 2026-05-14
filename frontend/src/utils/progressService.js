let listeners = new Set();

const notify = (state) => {
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {}
  });
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const start = (initial = 0) => notify({ type: "start", value: initial });
const update = (value) => notify({ type: "update", value });
const finish = () => notify({ type: "finish" });

export default {
  subscribe,
  start,
  update,
  finish,
};
