const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const postsDir = path.join(__dirname, 'posts');

app.use(express.static('public'));

// API to get all posts
app.get('/api/posts', (req, res) => {
  fs.readdir(postsDir, (err, files) => {
    if (err) return res.status(500).send('Server error');

    const posts = files.filter(f => f.endsWith('.txt')).map(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
      const [meta] = content.split('---');
      const titleMatch = meta.match(/Title:\s*(.+)/);
      const dateMatch = meta.match(/Date:\s*(.+)/);
      return {
        file,
        title: titleMatch ? titleMatch[1] : 'Untitled',
        date: dateMatch ? dateMatch[1] : ''
      };
    });

    res.json(posts);
  });
});

// API to get single post
app.get('/api/post/:file', (req, res) => {
  const filePath = path.join(postsDir, req.params.file);
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');

  const content = fs.readFileSync(filePath, 'utf-8');
  const [meta, ...body] = content.split('---');
  const titleMatch = meta.match(/Title:\s*(.+)/);
  const dateMatch = meta.match(/Date:\s*(.+)/);
  const post = {
    title: titleMatch ? titleMatch[1] : 'Untitled',
    date: dateMatch ? dateMatch[1] : '',
    body: body.join('---').trim()
  };

  res.json(post);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

