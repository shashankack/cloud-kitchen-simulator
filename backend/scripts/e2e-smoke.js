// End-to-end smoke script: create room, seed servers/tasks, trigger scheduler and poll.
const BASE = process.env.BASE_URL || 'http://localhost:5000';

async function req(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch (e) { body = text; }
  return { status: res.status, body };
}

(async function main(){
  try {
    console.log('Creating room...');
    let r = await req('/api/rooms', { method: 'POST', body: JSON.stringify({ name: 'e2e-smoke-room' }) });
    if (r.status !== 201) throw new Error('failed create room ' + JSON.stringify(r));
    const room = r.body;
    console.log('Room created:', room.roomId);

    const roomId = room.roomId;

    console.log('Seeding servers...');
    r = await req('/api/servers/seed', { method: 'POST', body: JSON.stringify({ roomId }) });
    if (r.status !== 200) throw new Error('failed seed servers ' + JSON.stringify(r));
    console.log('Seeded servers:', r.body.length);

    console.log('Seeding tasks...');
    r = await req('/api/tasks/seed', { method: 'POST', body: JSON.stringify({ roomId, count: 6 }) });
    if (r.status !== 200) throw new Error('failed seed tasks ' + JSON.stringify(r));
    console.log('Seeded tasks:', r.body.length);

    console.log('Triggering scheduler...');
    r = await req('/api/schedule/trigger', { method: 'POST', body: JSON.stringify({ roomId }) });
    if (r.status !== 200) console.warn('schedule trigger response', r);
    else console.log('Scheduler allocations:', JSON.stringify(r.body));

    console.log('Polling tasks until no running or waiting tasks (timeout 2m)...');
    const start = Date.now();
    while (Date.now() - start < 120000) {
      const tasksRes = await req(`/api/tasks?roomId=${roomId}`);
      const serversRes = await req(`/api/servers?roomId=${roomId}`);
      if (tasksRes.status !== 200) throw new Error('failed list tasks ' + JSON.stringify(tasksRes));
      const tasks = tasksRes.body;
      const servers = serversRes.status === 200 ? serversRes.body : [];

      const running = tasks.filter(t => t.status === 'running');
      const waiting = tasks.filter(t => t.status === 'waiting');
      const failed = tasks.filter(t => t.status === 'failed');
      const completed = tasks.filter(t => t.status === 'completed');

      console.log(new Date().toISOString(), `running=${running.length} waiting=${waiting.length} failed=${failed.length} completed=${completed.length} servers=${servers.length}`);

      // log statuses of running tasks
      running.slice(0,5).forEach(t => {
        console.log(' RUN:', t._id, t.name, 'startedAt=', t.startedAt, 'execTime=', t.executionTime);
      });

      if (running.length === 0 && waiting.length === 0) {
        console.log('All tasks finished or failed; exiting poll.');
        break;
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    // final state
    const finalTasks = await req(`/api/tasks?roomId=${roomId}`);
    console.log('Final tasks:', finalTasks.status, finalTasks.body.map(t => ({ id: t._id, status: t.status })));

    // cleanup: reset tasks and servers
    console.log('Cleaning up: resetting tasks and servers for room');
    await req('/api/tasks/reset', { method: 'POST', body: JSON.stringify({ roomId }) });
    await req('/api/servers/reset', { method: 'POST', body: JSON.stringify({ roomId }) });

    console.log('E2E smoke complete');
    process.exit(0);
  } catch (err) {
    console.error('E2E error:', err);
    process.exit(1);
  }
})();
