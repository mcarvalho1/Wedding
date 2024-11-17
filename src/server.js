const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('./src/database.sqlite', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criação da tabela de presentes se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS presentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    imagem TEXT NOT NULL,
    indisponivel BOOLEAN DEFAULT 0,
    metodoPagamento TEXT
  )
`);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname)));

// Configuração do multer para armazenamento de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    
    // Verifica se o diretório de uploads existe, senão cria
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Endpoint para adicionar um novo presente
app.post('/api/presentes', upload.single('imagemUpload'), (req, res) => {
  const { nome, preco } = req.body;
  let imagem = req.body.imagem || '';

  // Verificação dos dados
  if (!nome || !preco) {
    res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
    return;
  }

  if (req.file) {
    imagem = `/uploads/${req.file.filename}`;
  } else if (!imagem) {
    res.status(400).json({ error: 'É necessário fornecer uma URL de imagem ou fazer upload de uma imagem.' });
    return;
  }

  const sql = 'INSERT INTO presentes (nome, preco, imagem) VALUES (?, ?, ?)';
  db.run(sql, [nome, preco, imagem], function (err) {
    if (err) {
      console.error('Erro ao inserir presente no banco de dados:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID });
    }
  });
});

// Endpoint para buscar os presentes
app.get('/api/presentes', (req, res) => {
  db.all('SELECT * FROM presentes', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Endpoint para confirmar um presente
app.post('/api/presentes/:id/confirmar', (req, res) => {
  const { id } = req.params;
  const { metodoPagamento } = req.body;
  const sql = `
    UPDATE presentes
    SET indisponivel = 1, metodoPagamento = ?
    WHERE id = ?
  `;
  db.run(sql, [metodoPagamento, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Presente confirmado com sucesso!' });
    }
  });
});

// Endpoint para excluir um presente
app.delete('/api/presentes/:id', (req, res) => {
  const { id } = req.params;
  
  const selectSql = 'SELECT indisponivel FROM presentes WHERE id = ?';
  
  db.get(selectSql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Presente não encontrado' });
    } else if (row.indisponivel) {
      res.status(400).json({ error: 'Presente já confirmado, não pode ser excluído' });
    } else {
      const deleteSql = 'DELETE FROM presentes WHERE id = ?';
      db.run(deleteSql, [id], function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ message: 'Presente excluído com sucesso!' });
        }
      });
    }
  });
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
