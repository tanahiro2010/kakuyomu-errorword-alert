import { Hono } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';

function generateErrorId(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(randomBytes, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

type Env = {
  Bindings: {
    // Define any environment bindings here if needed
    DB: D1Database;
  };
  Variables: {}
}

const app = new Hono<Env>();

// クロスオリジンリクエストを許可
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', 'https://kakuyomu.jp');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (c.req.method === 'OPTIONS') {
    return c.text('OK');
  }
  return next();
});

app.get('/', (c) => {
  return c.text('Hello, World!');
});

app.get('/works/:workId/errors', async (c) => {
  const { workId } = c.req.param();
  // ここで作品の誤字報告を取得するロジックを実装
  const db = c.env.DB;
  try {
    const result = await db.prepare('SELECT * FROM errors WHERE work_id = ?')
      .bind(workId)
      .all();

    if (result.success) {
      return c.json(result.results);
    } else {
      return c.json({ error: 'Failed to fetch error reports.' }, 500);
    }
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Internal server error.', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

app.get('/works/:workId/episodes/:episodeId/errors', async (c) => {
  const { workId, episodeId } = c.req.param();
  // ここで特定のエピソードの誤字報告を取得するロジックを実装
  const db = c.env.DB;
  try {
    const result = await db.prepare('SELECT * FROM errors WHERE work_id = ? AND episode_id = ?')
      .bind(workId, episodeId)
      .all();

    if (result.success) {
      return c.json(result.results);
    } else {
      return c.json({ error: 'Failed to fetch error reports.' }, 500);
    }
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Internal server error.', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

app.patch('/works/:workId/episodes/:episodeId/errors/:errorId/edit', async (c) => {
  const { workId, episodeId, errorId } = c.req.param();

  // ここで誤字報告の編集処理を実装
  const db = c.env.DB;
  try {
    const result = await db.prepare('UPDATE errors SET edited = 1 WHERE work_id = ? AND episode_id = ? AND error_id = ?')
      .bind(workId, episodeId, errorId)
      .run();

    if (result.success) {
      return c.json({ message: 'Error report updated successfully.' });
    } else {
      return c.json({ error: 'Failed to update error report.', details: result }, 500);
    }
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Internal server error.', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

app.get('/works/:workId/episodes/:episodeId/errors/:errorId', async (c) => {
  const { workId, episodeId, errorId } = c.req.param();
  // ここで特定の誤字報告を取得するロジックを実装
  const db = c.env.DB;
  try {
    const result = await db.prepare('SELECT * FROM errors WHERE work_id = ? AND episode_id = ? AND error_id = ?')
      .bind(workId, episodeId, errorId)
      .first();

    if (result) {
      return c.json(result);
    } else {
      return c.json({ error: 'Error report not found.' }, 404);
    }
  } catch (error) {
    return c.json({ error: 'Internal server error.', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

app.post('/works/:workId/episodes/:episodeId/errors/new', async (c) => {
  const { workId, episodeId } = c.req.param();
  const body = await c.req.parseBody();

  console.log('Received request:', { workId, episodeId, body });

  if (!(workId.length === 20 || episodeId.length === 20)) {
    return c.json({ error: 'Invalid workId or episodeId.' }, 400);
  }

  const changedParagraphs = body.changed_paragraphs;
  const comment = body.comment;

  if (!changedParagraphs || typeof changedParagraphs !== 'string') {
    return c.json({ error: 'No changes detected.' }, 400);
  }

  // データベースの存在確認
  if (!c.env.DB) {
    console.error('Database not available');
    return c.json({ error: 'Database not configured.' }, 500);
  }

  const db = c.env.DB;
  const errorId = generateErrorId(); // bin2hex関数を使用したID生成

  console.log('Attempting to insert:', { errorId, workId, episodeId, changedParagraphs, comment });

  try {
    const result = await db.prepare('INSERT INTO errors (error_id, work_id, episode_id, error, comment, edited) VALUES (?, ?, ?, ?, ?, 0)')
      .bind(errorId, workId, episodeId, changedParagraphs, comment)
      .run();

    console.log('Database result:', result);

    if (result.success) {
      return c.json({ message: 'Error report submitted successfully.', errorId }, 201);
    } else {
      console.error('Database insert failed:', result);
      return c.json({ error: 'Failed to submit error report.', details: result }, 500);
    }
  } catch (error) {
    console.error('Database error:', error);
    return c.json({
      error: 'Internal server error.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;