const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// String de conexão com o MongoDB
const uri = '	mongodb+srv://esistemasdv:lZnbS7R978pb8vAu@test-nootech.94qfk.mongodb.net/?retryWrites=true&w=majority&appName=test-nootech';

// Diretório base onde estão as pastas com os arquivos JSON
const baseDir = './instances';

async function migrateData() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('test-nootech-instaces');

    // Ler todas as pastas dentro do diretório base
    const collections = fs.readdirSync(baseDir);

    for (const collection of collections) {
      const collectionPath = path.join(baseDir, collection);
      
      // Verifica se o item é uma pasta
      if (fs.statSync(collectionPath).isDirectory()) {
        console.log(`Migrando coleção: ${collection}`);
        
        const files = fs.readdirSync(collectionPath);

        for (const file of files) {
          const filePath = path.join(collectionPath, file);

          // Verifica se é um arquivo JSON
          if (path.extname(file) === '.json') {
            const data = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(data);

            // Insere o JSON como documento na coleção
            await db.collection(collection).insertOne(jsonData);
            console.log(`Inserido: ${file} na coleção ${collection}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Erro durante a migração:', err);
  } finally {
    await client.close();
    console.log('Conexão fechada');
  }
}

migrateData();
