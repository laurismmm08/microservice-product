const sqlite3 = require('sqlite3').verbose();

// Cria banco em memória
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    
    console.log('Connected to SQLite database');
    
    // Cria tabela
    db.run(`CREATE TABLE product (
        id_product INTEGER PRIMARY KEY,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        width INTEGER,
        height INTEGER,
        length INTEGER,
        weight REAL
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
            return;
        }
        
        // Insere dados de teste
        const stmt = db.prepare('INSERT INTO product (id_product, description, price) VALUES (?, ?, ?)');
        for (let i = 1; i <= 20; i++) {
            stmt.run(i, `Product ${i}`, i * 10);
        }
        stmt.finalize();
        
        // Testa query de paginação
        const page = 1;
        const limit = 5;
        const offset = (page - 1) * limit;
        
        console.log('\n=== Testando query de paginação ===');
        console.log(`Page: ${page}, Limit: ${limit}, Offset: ${offset}`);
        
        // Query paginada
        db.all('SELECT * FROM product ORDER BY id_product LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
            if (err) {
                console.error('Error in paginated query:', err.message);
                return;
            }
            
            console.log(`\nResultado paginado (${rows.length} produtos):`);
            rows.forEach(row => {
                console.log(`  ID: ${row.id_product}, Desc: ${row.description}, Price: ${row.price}`);
            });
            
            // Query count
            db.get('SELECT COUNT(*) as total FROM product', (err, result) => {
                if (err) {
                    console.error('Error in count query:', err.message);
                    return;
                }
                
                const total = result.total;
                const totalPages = Math.ceil(total / limit);
                console.log(`\nTotal: ${total}, Total Pages: ${totalPages}`);
                
                db.close();
            });
        });
    });
});
