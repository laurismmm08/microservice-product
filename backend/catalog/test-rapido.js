const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    console.log('Query params:', req.query);
    console.log('Has page?', req.query.page !== undefined);
    console.log('Has limit?', req.query.limit !== undefined);
    
    // Simula nosso comportamento
    if (req.query.page !== undefined || req.query.limit !== undefined) {
        res.json({ data: ['paginated'], pagination: {} });
    } else {
        res.json(['array', 'direct']);
    }
});

app.listen(3002, () => {
    console.log('Test server on 3002');
    console.log('Test with: curl http://localhost:3002/test');
    console.log('Test with params: curl "http://localhost:3002/test?page=1"');
});
